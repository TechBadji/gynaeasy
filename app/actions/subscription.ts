"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import { PlanAbonnement } from "@prisma/client";

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

export async function syncSubscriptionPlans() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
             return { success: false, message: "Non autorisé" };
        }

        for (const plan of SUBSCRIPTION_PLANS) {
            const planEnum = plan.id.toUpperCase() as PlanAbonnement;
            
            await prisma.planConfig.upsert({
                where: { plan: planEnum },
                update: {
                    prixMensuel: plan.price,
                    description: plan.description,
                    features: plan.features as any,
                    isPromotional: plan.isPopular
                },
                create: {
                    plan: planEnum,
                    prixMensuel: plan.price,
                    description: plan.description,
                    features: plan.features as any,
                    isPromotional: plan.isPopular
                }
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error("Sync Plans Error:", error);
        return { success: false };
    }
}
export async function requestPlanUpgrade(newPlan: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, message: "Non authentifié" };
        const userId = (session.user as any).id;

        const currentSub = await prisma.abonnement.findFirst({ 
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        const planEnum = newPlan.toUpperCase() as PlanAbonnement;
        
        if (currentSub) {
            if (currentSub.plan === planEnum) {
                return { success: false, message: "Vous utilisez déjà ce plan" };
            }

            // 1. Mettre à jour l'abonnement existant
            await prisma.abonnement.update({
                where: { id: currentSub.id },
                data: {
                    plan: planEnum,
                    statut: "ACTIF",
                    notesPromo: `Upgrade depuis ${currentSub.plan} - ${new Date().toLocaleDateString()}`
                }
            });
        } else {
            // 1. Créer un nouvel abonnement s'il n'existe pas
            await prisma.abonnement.create({
                data: {
                    userId,
                    plan: planEnum,
                    statut: "ACTIF",
                    dateDebut: new Date(),
                    dateFin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    notesPromo: `Premier abonnement - ${new Date().toLocaleDateString()}`
                }
            });
        }

        // 2. Créer une notification pour l'administrateur
        const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
        if (admin) {
            await prisma.notification.create({
                data: {
                    userId: admin.id,
                    titre: "Upgrade d'abonnement",
                    message: `Le Dr. ${session.user.name} a migré vers le plan ${planEnum}.`,
                    type: "SUCCESS",
                    link: `/admin?tab=abonnements`
                }
            });
        }

        // 3. Créer une facture en attente pour la différence (Optionnel selon business model)
        // Ici on simplifie en notifiant juste le succès
        
        return { success: true, message: `Votre plan a été mis à jour vers ${newPlan} !` };
    } catch (error) {
        console.error("Upgrade Error:", error);
        return { success: false, message: "Erreur lors du changement de plan" };
    }
}

export async function getActiveAdvertisements() {
    try {
        const now = new Date();
        const ads = await prisma.advertisement.findMany({
            where: {
                statut: "ACTIF",
                dateDebut: { lte: now },
                dateFin: { gte: now }
            },
            take: 1, // Only show one active ad at a time (can be randomized later)
            orderBy: { createdAt: "desc" }
        });
        
        return ads.map(ad => ({
            ...ad,
            dateDebut: ad.dateDebut.toISOString(),
            dateFin: ad.dateFin.toISOString(),
            createdAt: ad.createdAt.toISOString(),
            updatedAt: ad.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error("Ads Error:", error);
        return [];
    }
}
