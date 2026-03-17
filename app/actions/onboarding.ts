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
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
        throw new Error("Cet email est déjà enregistré.");
    }

    const verificationToken = crypto.randomUUID();

    const user = await prisma.user.create({
        data: {
            ...data,
            role: Role.MEDECIN,
            status: AccountStatus.PENDING_VERIFICATION,
            verificationToken,
            // Password will be generated upon approval
        }
    });

    try {
        await sendVerificationEmail(data.email, data.name, verificationToken);
    } catch (error) {
        console.error("Email error:", error);
        // We still created the user, they can retry verification later if we add a resend action
    }

    return { success: true };
}

export async function verifyDoctorEmail(token: string) {
    const user = await prisma.user.findUnique({
        where: { verificationToken: token }
    });

    if (!user) {
        throw new Error("Jeton de vérification invalide.");
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            status: AccountStatus.PENDING_APPROVAL,
            verificationToken: null, // Clear token after use
        }
    });

    return { success: true };
}

export async function approveRegistration(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
 
    if (!user || (user.status !== AccountStatus.PENDING_APPROVAL && user.status !== AccountStatus.PENDING_VERIFICATION)) {
        throw new Error("Utilisateur non trouvé ou déjà validé.");
    }

    const tempPassword = generatePassword();
    const { hash } = await import("bcryptjs");
    const hashedPassword = await hash(tempPassword, 10);

    // Default modules for a new doctor
    const defaultModules = ["AGENDA", "PATIENTS", "FACTURATION", "CONSULTATION", "IMAGERIE"];

    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            status: AccountStatus.ACTIVE,
            enabledModules: defaultModules,
        }
    });

    // Create a default subscription
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
        console.error("Email error:", error);
    }

    revalidatePath("/admin");
    return { success: true };
}

export async function getPendingRegistrations() {
    return await prisma.user.findMany({
        where: { 
            status: {
                in: [AccountStatus.PENDING_APPROVAL, AccountStatus.PENDING_VERIFICATION]
            }
        },
        orderBy: { createdAt: "desc" }
    });
}
