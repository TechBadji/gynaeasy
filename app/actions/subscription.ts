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

        // Priorité : abonnement ACTIF le plus récent, sinon le plus récent quel que soit le statut
        const subscription =
            await prisma.abonnement.findFirst({ where: { userId, statut: "ACTIF" }, orderBy: { createdAt: "desc" } }) ||
            await prisma.abonnement.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });

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

        // dateFin calculée = dateDebut + 1 an si absente (abonnement annuel)
        const dateDebut = subscription.dateDebut;
        const dateFin   = subscription.dateFin
            ?? new Date(new Date(dateDebut).setFullYear(new Date(dateDebut).getFullYear() + 1));

        return {
            id:                 subscription.id,
            plan:               subscription.plan,
            statut:             subscription.statut,
            dateDebut:          dateDebut.toISOString(),
            dateFin:            dateFin.toISOString(),
            cancelScheduled:    subscription.cancelScheduled,
            cancelRequestedAt:  subscription.cancelRequestedAt?.toISOString() || null,
            reductionType:      subscription.reductionType,
            reductionValeur:    subscription.reductionValeur,
            notesPromo:         subscription.notesPromo,
            createdAt:          subscription.createdAt.toISOString(),
            updatedAt:          subscription.updatedAt.toISOString(),
            config: planConfig ? {
                prixMensuel: planConfig.prixMensuel,
                description: planConfig.description,
                features:    planConfig.features as any,
                updatedAt:   planConfig.updatedAt.toISOString(),
            } : null,
            factures: factures.map((f: any) => ({
                id:          f.id,
                numero:      f.numero,
                periodeDebut: f.periodeDebut.toISOString(),
                periodeFin:  f.periodeFin.toISOString(),
                montantHT:   f.montantHT,
                montantTTC:  f.montantTTC,
                statut:      f.statut,
                url:         f.url,
                createdAt:   f.createdAt.toISOString(),
            })),
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
export async function requestPlanUpgrade(newPlan: string, message?: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, message: "Non authentifié" };
        const userId = (session.user as any).id;

        const planEnum = newPlan.toUpperCase() as PlanAbonnement;

        const currentSub = await prisma.abonnement.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        if (currentSub?.plan === planEnum) {
            return { success: false, message: "Vous utilisez déjà ce plan" };
        }

        // Bloquer les doublons
        const existing = await prisma.demandeUpgrade.findFirst({
            where: { userId, statut: "EN_ATTENTE" },
        });
        if (existing) {
            return { success: false, message: "Une demande est déjà en cours de traitement" };
        }

        const planActuel = (currentSub?.plan ?? "SOLO") as PlanAbonnement;

        await prisma.demandeUpgrade.create({
            data: { userId, planActuel, planDemande: planEnum, message: message?.trim() || null },
        });

        // Notifier tous les admins
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
        await prisma.notification.createMany({
            data: admins.map(a => ({
                userId: a.id,
                titre: "Nouvelle demande d'upgrade",
                message: `Dr. ${session.user.name} souhaite passer du plan ${planActuel} → ${planEnum}.`,
                type: "WARNING" as const,
                link: "/admin?tab=abonnements",
            })),
        });

        return { success: true, message: "Votre demande a été transmise. Vous serez notifié(e) dès validation." };
    } catch (error) {
        console.error("Upgrade Error:", error);
        return { success: false, message: "Erreur lors de la demande de changement de plan" };
    }
}

export async function getMyUpgradeRequest() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return null;
        const userId = (session.user as any).id;

        const demande = await prisma.demandeUpgrade.findFirst({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        if (!demande) return null;
        return {
            id:          demande.id,
            planActuel:  demande.planActuel,
            planDemande: demande.planDemande,
            statut:      demande.statut,
            noteAdmin:   demande.noteAdmin,
            createdAt:   demande.createdAt.toISOString(),
        };
    } catch {
        return null;
    }
}

export async function getPublicPlanConfigs() {
    try {
        const configs = await prisma.planConfig.findMany({ orderBy: { updatedAt: "desc" } });
        if (configs.length === 0) {
            return SUBSCRIPTION_PLANS.map(p => ({
                plan: p.id.toUpperCase(),
                prixMensuel: p.price,
                prixAnnuel: null as number | null,
                description: p.description,
                features: p.features as { text: string; included: boolean }[],
                isPromotional: p.isPopular,
            }));
        }
        return JSON.parse(JSON.stringify(configs)) as {
            plan: string;
            prixMensuel: number;
            prixAnnuel: number | null;
            description: string | null;
            features: { text: string; included: boolean }[] | null;
            isPromotional: boolean;
        }[];
    } catch {
        return SUBSCRIPTION_PLANS.map(p => ({
            plan: p.id.toUpperCase(),
            prixMensuel: p.price,
            prixAnnuel: null as number | null,
            description: p.description,
            features: p.features as { text: string; included: boolean }[],
            isPromotional: p.isPopular,
        }));
    }
}

export async function validatePromoCode(code: string, plan?: string) {
    try {
        const promo = await prisma.promotion.findUnique({ where: { code: code.toUpperCase().trim() } });
        if (!promo) return { valid: false, message: "Code introuvable" };
        if (!promo.active) return { valid: false, message: "Ce code n'est plus actif" };
        if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
            return { valid: false, message: "Ce code a expiré" };
        }
        if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
            return { valid: false, message: "Ce code a atteint sa limite d'utilisation" };
        }
        if (plan && promo.applicableTo.length > 0 && !promo.applicableTo.includes(plan.toUpperCase())) {
            return { valid: false, message: `Ce code n'est pas valable pour le plan ${plan}` };
        }
        return {
            valid: true,
            promo: {
                id: promo.id,
                code: promo.code,
                type: promo.type,
                valeur: promo.valeur,
                description: promo.description,
            }
        };
    } catch {
        return { valid: false, message: "Erreur de validation" };
    }
}

export async function applyPromoCode(code: string, plan: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, message: "Non authentifié" };
    const userId = (session.user as any).id;

    const promo = await prisma.promotion.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!promo || !promo.active) return { success: false, message: "Code invalide" };
    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
        return { success: false, message: "Code expiré" };
    }
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
        return { success: false, message: "Limite atteinte" };
    }

    if (promo.usagePerUser) {
        const userUsage = await prisma.promoUsage.count({ where: { promoId: promo.id, userId } });
        if (userUsage >= promo.usagePerUser) {
            return { success: false, message: "Vous avez déjà utilisé ce code" };
        }
    }

    await prisma.$transaction([
        prisma.promoUsage.create({ data: { promoId: promo.id, userId, plan: plan.toUpperCase() } }),
        prisma.promotion.update({ where: { id: promo.id }, data: { usageCount: { increment: 1 } } }),
    ]);

    return {
        success: true,
        promo: { id: promo.id, code: promo.code, type: promo.type, valeur: promo.valeur },
    };
}

export async function getActiveAdvertisements(userPlan?: string) {
    try {
        const session = await getServerSession(authOptions);
        const plan = userPlan ?? (session ? await prisma.abonnement.findFirst({
            where: { userId: (session.user as any).id },
            select: { plan: true },
            orderBy: { createdAt: "desc" },
        }).then(s => s?.plan ?? null) : null);

        const now = new Date();
        const ads = await prisma.advertisement.findMany({
            where: {
                statut: "ACTIF",
                dateDebut: { lte: now },
                dateFin: { gte: now },
            },
            orderBy: { createdAt: "desc" }
        });

        const eligible = ads.filter(ad =>
            ad.formatCible.length === 0 || (plan && ad.formatCible.includes(plan))
        );

        const selected = eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : null;
        if (!selected) return [];

        return [{
            ...selected,
            dateDebut: selected.dateDebut.toISOString(),
            dateFin: selected.dateFin.toISOString(),
            createdAt: selected.createdAt.toISOString(),
            updatedAt: selected.updatedAt.toISOString(),
        }];
    } catch (error) {
        console.error("Ads Error:", error);
        return [];
    }
}

export async function cancelSubscription() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, message: "Non authentifié" };
        const userId = (session.user as any).id;

        const sub = await prisma.abonnement.findFirst({
            where: { userId, statut: "ACTIF" },
            orderBy: { createdAt: "desc" },
        });
        if (!sub) return { success: false, message: "Aucun abonnement actif trouvé" };
        if (sub.cancelScheduled) return { success: false, message: "Résiliation déjà programmée" };

        // dateFin = soit la vraie, soit dateDebut + 1 an
        const dateFin = sub.dateFin
            ?? new Date(new Date(sub.dateDebut).setFullYear(new Date(sub.dateDebut).getFullYear() + 1));

        await prisma.abonnement.update({
            where: { id: sub.id },
            data: { cancelScheduled: true, cancelRequestedAt: new Date(), dateFin },
        });

        // Notifier les admins
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
        await prisma.notification.createMany({
            data: admins.map(a => ({
                userId: a.id,
                titre:   "Demande de résiliation",
                message: `Dr. ${session.user.name} a demandé la résiliation de son abonnement ${sub.plan}. Accès jusqu'au ${dateFin.toLocaleDateString("fr-FR")}.`,
                type:    "WARNING" as const,
                link:    "/admin?tab=abonnements",
            })),
        });

        return { success: true, dateFin: dateFin.toISOString() };
    } catch (error) {
        console.error("Cancel Error:", error);
        return { success: false, message: "Erreur lors de la résiliation" };
    }
}

export async function revertCancellation() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, message: "Non authentifié" };
        const userId = (session.user as any).id;

        const sub = await prisma.abonnement.findFirst({
            where: { userId, statut: "ACTIF", cancelScheduled: true },
            orderBy: { createdAt: "desc" },
        });
        if (!sub) return { success: false, message: "Aucune résiliation en cours" };

        await prisma.abonnement.update({
            where: { id: sub.id },
            data: { cancelScheduled: false, cancelRequestedAt: null },
        });

        return { success: true };
    } catch (error) {
        console.error("Revert Cancel Error:", error);
        return { success: false, message: "Erreur lors de l'annulation" };
    }
}
