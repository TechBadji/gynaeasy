"use server"

import { prisma } from "@/lib/prisma";
import { AccountStatus, Role } from "@prisma/client";
import { sendVerificationEmail, sendCredentialsEmail } from "@/lib/mail";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

/**
 * Generates a 6-character alphanumeric password
 */
function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like 1, I, 0, O
    let password = "";
    for (let i = 0; i < 6; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export async function registerDoctor(data: {
    name: string;
    email: string;
    clinicName: string;
    specialite: string;
}) {
    try {
        // Validation basique
        if (!data.email || !data.name) {
            return { success: false, error: "Nom et email requis." };
        }

        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            return { success: false, error: "Cet email est déjà enregistré." };
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                clinicName: data.clinicName,
                specialite: data.specialite,
                role: "MEDECIN",
                status: "PENDING_VERIFICATION",
                verificationToken,
            }
        });

        try {
            await sendVerificationEmail(data.email, data.name, verificationToken);
        } catch (mailError) {
            console.error("Email sending failure (ignored):", mailError);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Registration critical error:", error);
        return { success: false, error: "Une erreur technique est survenue. Veuillez réessayer." };
    }
}

export async function verifyDoctorEmail(token: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { verificationToken: token }
        });

        if (!user) {
            return { success: false, error: "Jeton de vérification invalide." };
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                status: "PENDING_APPROVAL",
                verificationToken: null,
            }
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveRegistration(userId: string) {
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
            }
        });

        await prisma.abonnement.create({
            data: {
                userId: user.id,
                plan: "PREMIUM",
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
        return { success: false, error: error.message };
    }
}

export async function getPendingRegistrations() {
    try {
        const users = await prisma.user.findMany({
            where: { 
                status: {
                    in: ["PENDING_APPROVAL", "PENDING_VERIFICATION"]
                }
            },
            orderBy: { createdAt: "desc" }
        });
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        return [];
    }
}
