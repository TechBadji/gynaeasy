"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserSubscription() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return null;

        const userId = (session.user as any).id;

        const subscription = await prisma.abonnement.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        if (!subscription) return null;

        // Récupérer aussi la config du plan pour les features
        const planConfig = await prisma.planConfig.findUnique({
            where: { plan: subscription.plan }
        });

        return {
            ...subscription,
            config: planConfig
        };
    } catch (error) {
        console.error("Subscription Error:", error);
        return null;
    }
}
