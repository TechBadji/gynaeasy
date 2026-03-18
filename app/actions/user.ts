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
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { success: false, error: "Non autorisé" };

        const updated = await (prisma.user as any).update({
            where: { email: session.user.email },
            data
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
            data: { password: hashedPassword }
        });

        return { success: true, message: "Mot de passe mis à jour avec succès" };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
