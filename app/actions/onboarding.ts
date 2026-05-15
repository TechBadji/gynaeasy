"use server"

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail, sendCredentialsEmail, sendAdminApprovalNotificationEmail } from "@/lib/mail";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export async function registerDoctor(data: {
    name: string;
    email: string;
    clinicName: string;
    specialite: string;
    plan?: string;
}) {
    try {
        const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
        if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
            return { success: false, error: "Trop de tentatives. Réessayez dans une heure." };
        }

        if (!data.email || !data.name) {
            return { success: false, error: "Nom et email requis." };
        }

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return { success: false, error: "Cet email est déjà enregistré." };
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

        await (prisma.user as any).create({
            data: {
                name: data.name,
                email: data.email,
                clinicName: data.clinicName,
                specialite: data.specialite,
                role: "MEDECIN",
                status: "PENDING_VERIFICATION",
                verificationToken,
                verificationTokenExpires,
                planId: data.plan || "SOLO",
            }
        });

        let emailSent = true;
        try {
            await sendVerificationEmail(data.email, data.name, verificationToken);
        } catch (mailError) {
            console.error("Email sending failure:", mailError);
            emailSent = false;
        }

        return {
            success: true,
            emailSent,
            message: emailSent
                ? "Compte créé. Vérifiez votre email pour confirmer votre inscription."
                : "Compte créé, mais l'email de vérification n'a pas pu être envoyé. Contactez l'administration.",
        };
    } catch (error: any) {
        console.error("[registerDoctor]:", error);
        return { success: false, error: "Une erreur technique est survenue. Veuillez réessayer." };
    }
}

export async function verifyDoctorEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const user = await (prisma.user as any).findUnique({
            where: { verificationToken: token }
        });

        if (!user) {
            return { success: false, error: "Jeton de vérification invalide ou déjà utilisé." };
        }

        if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
            return { success: false, error: "Ce lien a expiré (validité 48h). Demandez un nouveau lien ci-dessous." };
        }

        let settings = await prisma.clinicSettings.findUnique({ where: { id: "singleton" } });
        if (!settings) {
            settings = await prisma.clinicSettings.create({ data: { id: "singleton" } });
        }

        if (!settings.requireApproval) {
            const res = await _approveRegistrationInternal(user.id);
            if (!res.success) return { success: false, error: res.error };
            return { success: true, message: "Email vérifié et compte activé avec succès !" };
        } else {
            await (prisma.user as any).update({
                where: { id: user.id },
                data: {
                    emailVerified: new Date(),
                    status: "PENDING_APPROVAL",
                    verificationToken: null,
                    verificationTokenExpires: null,
                }
            });

            // Notifier l'admin
            try {
                const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
                if (admin) {
                    await prisma.notification.create({
                        data: {
                            userId: admin.id,
                            titre: "Nouvelle inscription en attente",
                            message: `Dr. ${user.name} (${user.email}) a vérifié son email et attend votre approbation.`,
                            type: "WARNING",
                            link: "/admin?tab=inscriptions"
                        }
                    });
                    if (admin.email) {
                        await sendAdminApprovalNotificationEmail(admin.email, user.name || "Inconnu", user.email || "");
                    }
                }
            } catch (notifError) {
                console.error("[verifyDoctorEmail] admin notification failed:", notifError);
            }

            return { success: true, message: "Email vérifié ! Votre compte est en attente d'approbation par l'administration." };
        }
    } catch (error: any) {
        console.error("[verifyDoctorEmail]:", error);
        return { success: false, error: "Une erreur est survenue lors de la vérification." };
    }
}

async function _approveRegistrationInternal(userId: string) {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || (user.status !== "PENDING_APPROVAL" && user.status !== "PENDING_VERIFICATION")) {
            return { success: false, error: "Utilisateur non trouvé ou déjà validé." };
        }

        const tempPassword = generatePassword();
        const { hash } = await import("bcryptjs");
        const hashedPassword = await hash(tempPassword, 10);

        const defaultModules = ["AGENDA", "PATIENTS", "FACTURATION", "CONSULTATION", "IMAGERIE"];

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                status: "ACTIVE",
                enabledModules: defaultModules,
                mustChangePassword: true,
            }
        });

        await prisma.abonnement.create({
            data: {
                userId: user.id,
                plan: (user.planId as any) || "SOLO",
                statut: "ACTIF",
                dateDebut: new Date(),
            }
        });

        try {
            await sendCredentialsEmail(user.email!, user.name!, tempPassword);
        } catch (error) {
            console.error("Credentials email error:", error);
        }

        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        console.error("[approveRegistration]:", error);
        return { success: false, error: "Une erreur est survenue lors de l'approbation." };
    }
}

export async function approveRegistration(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return { success: false, error: "Non autorisé" };
    }
    return _approveRegistrationInternal(userId);
}

export async function resendVerificationEmail(email: string) {
    // Rate limit : 1 renvoi par email toutes les 5 minutes — fail silencieux
    if (!checkRateLimit(`resend:${email.toLowerCase()}`, 1, 5 * 60 * 1000)) {
        return { success: true };
    }

    try {
        const user = await (prisma.user as any).findUnique({ where: { email: email.toLowerCase() } });

        // Toujours retourner succès pour éviter l'énumération
        if (!user || user.status !== "PENDING_VERIFICATION") return { success: true };

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 48 * 60 * 60 * 1000);

        await (prisma.user as any).update({
            where: { id: user.id },
            data: { verificationToken: token, verificationTokenExpires: expires }
        });

        await sendVerificationEmail(user.email!, user.name!, token);
    } catch (error) {
        console.error("[resendVerificationEmail]:", error);
    }

    return { success: true };
}

export async function getPendingRegistrations() {
    try {
        const users = await prisma.user.findMany({
            where: {
                status: {
                    in: ["PENDING_APPROVAL", "PENDING_VERIFICATION"]
                }
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        return [];
    }
}
