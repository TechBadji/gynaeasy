"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Récupère les notifications de l'utilisateur connecté
 */
export async function getNotifications() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return [];

        const userId = (session.user as any).id;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Sérialisation des dates
        return notifications.map((n: any) => ({
            ...n,
            createdAt: n.createdAt.toISOString()
        }));
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return [];
    }
}

/**
 * Marque une notification comme lue
 */
export async function markAsRead(id: string) {
    try {
        await prisma.notification.update({
            where: { id },
            data: { read: true }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllAsRead() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false };
        const userId = (session.user as any).id;

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Créer une notification (Utilitaire interne)
 */
export async function createNotification(userId: string, titre: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'URGENT' = 'INFO', link?: string) {
    try {
        const notif = await prisma.notification.create({
            data: {
                userId,
                titre,
                message,
                type,
                link
            }
        });
        return notif;
    } catch (error) {
        console.error("Create notification error:", error);
        return null;
    }
}
