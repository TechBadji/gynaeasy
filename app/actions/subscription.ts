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

        // Récupérer les factures
        const factures = await prisma.factureHote.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        // Récupérer aussi la config du plan pour les features
        const planConfig = await prisma.planConfig.findUnique({
            where: { plan: subscription.plan }
        });

        // Sérialisation pour éviter les bugs de Date (RSC)
        return {
            id: subscription.id,
            plan: subscription.plan,
            statut: subscription.statut,
            dateDebut: subscription.dateDebut.toISOString(),
            dateFin: subscription.dateFin?.toISOString() || null,
            reductionType: subscription.reductionType,
            reductionValeur: subscription.reductionValeur,
            notesPromo: subscription.notesPromo,
            createdAt: subscription.createdAt.toISOString(),
            updatedAt: subscription.updatedAt.toISOString(),
            config: planConfig ? {
                prixMensuel: planConfig.prixMensuel,
                description: planConfig.description,
                features: planConfig.features as any,
                updatedAt: planConfig.updatedAt.toISOString(),
            } : null,
            factures: factures.map((f: any) => ({
                id: f.id,
                numero: f.numero,
                periodeDebut: f.periodeDebut.toISOString(),
                periodeFin: f.periodeFin.toISOString(),
                montantHT: f.montantHT,
                montantTTC: f.montantTTC,
                statut: f.statut,
                url: f.url,
                createdAt: f.createdAt.toISOString()
            }))
        };
    } catch (error) {
        console.error("Subscription Error:", error);
        return null;
    }
}

/**
 * Crée une facture de test pour la démo
 */
export async function createDemoInvoice() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false };
        const userId = (session.user as any).id;

        const sub = await prisma.abonnement.findFirst({ where: { userId } });
        if (!sub) return { success: false, message: "Aucun abonnement" };

        const lastInvoice = await prisma.factureHote.findFirst({ orderBy: { createdAt: 'desc' } });
        const nextNum = (lastInvoice ? parseInt(lastInvoice.numero.split('-').pop() || "0") : 0) + 1;
        const numero = `FA-${new Date().getFullYear()}-${nextNum.toString().padStart(3, '0')}`;

        await prisma.factureHote.create({
            data: {
                userId,
                numero,
                periodeDebut: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                periodeFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                montantHT: 35000,
                montantTTC: 35000,
                statut: 'PAYEE'
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Demo Invoice Error:", error);
        return { success: false };
    }
}
