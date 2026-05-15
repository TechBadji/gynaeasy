"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/**
 * Met à jour les informations personnelles de l'utilisateur (médecin/secrétaire)
 */
export async function updateUserDetails(data: {
    name?: string;
    clinicName?: string;
    specialite?: string;
    isEmergencyAvailable?: boolean;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { success: false, error: "Non autorisé" };

        const ALLOWED_KEYS = new Set<string>(['name', 'clinicName', 'specialite', 'isEmergencyAvailable']);
        const updateData: Record<string, unknown> = {};
        for (const k of Object.keys(data)) {
            if (ALLOWED_KEYS.has(k) && (data as any)[k] !== undefined) {
                updateData[k] = (data as any)[k];
            }
        }
        if (Object.keys(updateData).length > 0) {
            await (prisma.user as any).update({
                where: { email: session.user.email },
                data: updateData,
            });
        }

        const updated = await (prisma.user as any).findUnique({
            where: { email: session.user.email }
        });

        revalidatePath("/parametres");
        return { success: true, user: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        console.error("[updateUserDetails]:", error);
        return { success: false, error: "Une erreur est survenue" };
    }
}

/**
 * Change le mot de passe de l'utilisateur
 */
export async function updatePassword(data: {
    currentPassword: string;
    newPassword: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { success: false, error: "Non autorisé" };

        const user = await (prisma.user as any).findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.password) return { success: false, error: "Utilisateur non trouvé" };

        const isMatch = await bcrypt.compare(data.currentPassword, user.password);
        if (!isMatch) return { success: false, error: "Ancien mot de passe incorrect" };

        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        await (prisma.user as any).update({
            where: { email: session.user.email },
            data: { 
                password: hashedPassword,
                mustChangePassword: false 
            }
        });

        return { success: true, message: "Mot de passe mis à jour avec succès" };
    } catch (error: any) {
        console.error("[updatePassword]:", error);
        return { success: false, error: "Une erreur est survenue" };
    }
}

/**
 * Définit le mot de passe lors de la première connexion (mustChangePassword = true).
 * N'exige pas l'ancien mot de passe — l'utilisateur est déjà authentifié avec son mot de passe temporaire.
 */
export async function setInitialPassword(newPassword: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { success: false, error: "Non autorisé" };

        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: "Mot de passe trop court (6 caractères minimum)" };
        }

        const user = await (prisma.user as any).findUnique({
            where: { email: session.user.email },
            select: { id: true, mustChangePassword: true }
        });

        if (!user) return { success: false, error: "Utilisateur non trouvé" };
        if (!user.mustChangePassword) return { success: false, error: "Action non autorisée" };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await (prisma.user as any).update({
            where: { id: user.id },
            data: { password: hashedPassword, mustChangePassword: false }
        });

        return { success: true };
    } catch (error: any) {
        console.error("[setInitialPassword]:", error);
        return { success: false, error: "Une erreur est survenue" };
    }
}

export async function updateUserAvatar(userId: string, imageData: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Non autorisé" };
        if ((session.user as any).id !== userId) return { success: false, error: "Non autorisé" };

        await prisma.user.update({
            where: { id: userId },
            data: { image: imageData }
        });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("Avatar Update Error:", error);
        return { success: false, error: "Erreur lors de la mise à jour de l'avatar." };
    }
}
