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

        // Bypass Prisma Client validation with Raw SQL if internal schema is not synced
        const keys = Object.keys(data).filter(k => (data as any)[k] !== undefined);
        if (keys.length > 0) {
            const setClauses = keys.map(k => {
                const val = (data as any)[k];
                if (typeof val === 'boolean') return `"${k}" = ${val}`;
                return `"${k}" = '${val.replace(/'/g, "''")}'`; // Basic escape
            });
            await prisma.$executeRawUnsafe(
                `UPDATE "User" SET ${setClauses.join(', ')}, "updatedAt" = NOW() WHERE email = '${session.user.email}'`
            );
        }

        const updated = await (prisma.user as any).findUnique({
            where: { email: session.user.email }
        });

        revalidatePath("/parametres");
        return { success: true, user: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Change le mot de passe de l'utilisateur
 */
export async function updatePassword(data: {
    currentPassword?: string;
    newPassword: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { success: false, error: "Non autorisé" };

        const user = await (prisma.user as any).findUnique({
            where: { email: session.user.email }
        });

        if (!user || !user.password) return { success: false, error: "Utilisateur non trouvé" };

        // Si currentPassword est fourni, on vérifie (sécurité optionnelle selon le flow mais conseillée)
        if (data.currentPassword) {
            const isMatch = await bcrypt.compare(data.currentPassword, user.password);
            if (!isMatch) return { success: false, error: "Ancien mot de passe incorrect" };
        }

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
        return { success: false, error: error.message };
    }
}

export async function updateUserAvatar(userId: string, imageData: string) {
    try {
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
