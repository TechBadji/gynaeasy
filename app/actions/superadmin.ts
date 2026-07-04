"use server";
// Schema Sync: 20-03-2026 12:04

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

async function checkSuperAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Non autorisé : Accès Super Admin requis");
    }
    return session;
}

// ============================================
// STATISTIQUES GLOBALES SAAS
// ============================================
export async function getSuperAdminStats() {
    await checkSuperAdmin();

    const [
        totalUsers,
        totalPatients,
        totalConsultations,
        totalAbonnements,
        recentConsultations,
        consultationsThisMonth,
        patientsThisMonth,
        recentAuditLogs,
        revenueData,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.patient.count(),
        prisma.consultation.count(),
        prisma.abonnement.count({ where: { statut: "ACTIF" } }),
        prisma.consultation.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                patient: { select: { nom: true, prenom: true } },
                user: { select: { name: true, email: true } },
            },
        }),
        prisma.consultation.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
        prisma.patient.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
        prisma.auditLog.findMany({
            take: 10,
            orderBy: { timestamp: "desc" },
        }),
        prisma.reglement.aggregate({
            _sum: { montant: true },
            where: { statut: "PAYE" },
        }),
    ]);

    // Consultations par mois (6 derniers mois)
    const consultationsByMonth = await getConsultationsByMonth();
    const usersByRole = await prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
    });
    const abonnementsByPlan = await prisma.abonnement.groupBy({
        by: ["plan"],
        _count: { plan: true },
        where: { statut: "ACTIF" },
    });

    return JSON.parse(JSON.stringify({
        kpis: {
            totalUsers,
            totalPatients,
            totalConsultations,
            totalAbonnements,
            consultationsThisMonth,
            patientsThisMonth,
            totalRevenue: revenueData._sum.montant || 0,
        },
        recentConsultations,
        recentAuditLogs,
        consultationsByMonth,
        usersByRole,
        abonnementsByPlan,
    }));
}

async function getConsultationsByMonth() {
    const now = new Date();
    const ranges = Array.from({ length: 6 }, (_, i) => {
        const d   = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
        return { d, end, label: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) };
    });
    const counts = await Promise.all(
        ranges.map(({ d, end }) =>
            prisma.consultation.count({ where: { createdAt: { gte: d, lt: end } } })
        )
    );
    return ranges.map(({ label }, i) => ({ month: label, count: counts[i] }));
}

// ============================================
// GESTION DES UTILISATEURS
// ============================================
export async function getAllUsers(skip = 0) {
    await checkSuperAdmin();
    const users = await prisma.user.findMany({
        take: 100,
        skip,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            enabledModules: true,
            twoFactorEnabled: true,
            twoFactorRequired: true,
            createdAt: true,
            linkedDoctorId: true,
            linkedDoctor: { select: { id: true, name: true } },
            _count: {
                select: { patients: true, consultations: true },
            },
            abonnements: {
                select: { plan: true, statut: true, dateDebut: true },
                orderBy: { createdAt: "desc" },
                take: 1,
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return JSON.parse(JSON.stringify(users));
}

export async function setUser2FARequired(userId: string, required: boolean) {
    try {
        await checkSuperAdmin();
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorRequired: required },
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
}

export async function createUserAdmin(data: {
    name: string;
    email: string;
    role: "MEDECIN" | "SECRETAIRE" | "ADMIN";
    password?: string;
    linkedDoctorId?: string;
}) {
    try {
        await checkSuperAdmin();

        const pwd = data.password?.trim();
        if (!pwd || pwd.length < 8) {
            return { success: false, error: "Mot de passe requis (8 caractères minimum)" };
        }
        const hashedPassword = await bcrypt.hash(pwd, 10);

        const defaultModules = data.role === "SECRETAIRE"
            ? ["AGENDA", "PATIENTS", "FACTURATION"]
            : ["AGENDA", "PATIENTS", "FACTURATION", "CONSULTATION", "IMAGERIE"];

        const user = await prisma.user.create({
            data: {
                name:          data.name,
                email:         data.email,
                password:      hashedPassword,
                role:          data.role,
                enabledModules: defaultModules,
                linkedDoctorId: data.role === "SECRETAIRE" && data.linkedDoctorId ? data.linkedDoctorId : undefined,
            },
            select: {
                id: true, name: true, email: true, role: true, status: true,
                enabledModules: true, twoFactorEnabled: true, twoFactorRequired: true,
                createdAt: true, linkedDoctorId: true,
                linkedDoctor: { select: { id: true, name: true } },
                _count: { select: { patients: true, consultations: true } },
                abonnements: { select: { plan: true, statut: true, dateDebut: true }, take: 1 },
            },
        });

        await prisma.abonnement.create({
            data: {
                userId:    user.id,
                plan:      data.role === "SECRETAIRE" ? "SOLO" : "CLINIQUE",
                statut:    "ACTIF",
                dateDebut: new Date(),
            },
        });

        revalidatePath("/admin");
        return { success: true, data: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function linkSecretaryToDoctor(secretaryId: string, doctorId: string | null) {
    try {
        await checkSuperAdmin();
        const user = await prisma.user.update({
            where:  { id: secretaryId },
            data:   { linkedDoctorId: doctorId },
            select: { id: true, name: true, linkedDoctorId: true, linkedDoctor: { select: { id: true, name: true } } },
        });
        revalidatePath("/admin");
        return { success: true, data: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateUserRoleAdmin(userId: string, role: "MEDECIN" | "SECRETAIRE" | "ADMIN") {
    try {
        await checkSuperAdmin();
        const user = await prisma.user.update({ where: { id: userId }, data: { role } });
        revalidatePath("/admin/super");
        return { success: true, data: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function setUserStatusAdmin(userId: string, status: "ACTIVE" | "BLOCKED" | "PENDING_APPROVAL") {
    try {
        await checkSuperAdmin();
        const user = await prisma.user.update({ 
            where: { id: userId }, 
            data: { status: status as any } 
        });
        revalidatePath("/admin/super");
        return { success: true, data: JSON.parse(JSON.stringify(user)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleUserModule(userId: string, moduleName: string) {
    try {
        await checkSuperAdmin();
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { enabledModules: true } });
        if (!user) throw new Error("Utilisateur non trouvé");

        const modules = [...user.enabledModules];
        const index = modules.indexOf(moduleName);

        if (index > -1) {
            modules.splice(index, 1);
        } else {
            modules.push(moduleName);
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { enabledModules: modules }
        });

        revalidatePath("/admin/super");
        revalidatePath("/dashboard");
        return { success: true, data: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteUserAdmin(userId: string) {
    try {
        await checkSuperAdmin();
        
        // On vérifie si l'utilisateur a des données médicales avant suppression
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                _count: {
                    select: { asTreating: true, consultations: true }
                }
            }
        });

        if (!user) return { success: false, error: "Utilisateur non trouvé" };

        if (user._count.asTreating > 0 || user._count.consultations > 0) {
            return { success: false, error: "Impossible de supprimer définitivement : ce compte contient des données médicales. Utilisez le blocage à la place." };
        }

        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/admin/super");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur lors de la suppression" };
    }
}

// ============================================
// GESTION DES ABONNEMENTS SAAS
// ============================================
export async function getAllAbonnements() {
    await checkSuperAdmin();
    const abs = await prisma.abonnement.findMany({
        take: 200,
        include: { user: { select: { name: true, email: true, role: true, clinicName: true } } },
        orderBy: { createdAt: "desc" },
    });
    // Calculer dateFin si absente (abonnement annuel)
    return abs.map(ab => ({
        ...ab,
        dateFin: ab.dateFin ?? new Date(new Date(ab.dateDebut).setFullYear(new Date(ab.dateDebut).getFullYear() + 1)),
    }));
}

export async function updateAbonnement(
    id: string,
    data: {
        plan?: "SOLO" | "PRO" | "CLINIQUE";
        statut?: "ACTIF" | "ANNULE" | "EXPIRE";
        dateFin?: Date | null;
        reductionType?: "POURCENTAGE" | "MONTANT_FIXE" | null;
        reductionValeur?: number | null;
        notesPromo?: string | null;
    }
) {
    await checkSuperAdmin();
    const ab = await prisma.abonnement.update({ where: { id }, data });
    revalidatePath("/admin");
    return JSON.parse(JSON.stringify(ab));
}

export async function createAbonnement(data: {
    userId: string;
    plan: "SOLO" | "PRO" | "CLINIQUE";
    statut: "ACTIF" | "ANNULE" | "EXPIRE";
    reductionType?: "POURCENTAGE" | "MONTANT_FIXE" | null;
    reductionValeur?: number | null;
    notesPromo?: string | null;
}) {
    await checkSuperAdmin();
    const ab = await prisma.abonnement.create({ data });
    revalidatePath("/admin");
    return JSON.parse(JSON.stringify(ab));
}

// ============================================
// GESTION DES PLANS (PRIX & FEATURES)
// ============================================
export async function getPlanConfigs() {
    await checkSuperAdmin();
    const configs = await prisma.planConfig.findMany();
    return JSON.parse(JSON.stringify(configs));
}

export async function updatePlanConfig(plan: "SOLO" | "PRO" | "CLINIQUE", data: {
    prixMensuel: number;
    prixAnnuel?: number | null;
    description?: string;
    features?: any;
    isPromotional?: boolean;
}) {
    await checkSuperAdmin();
    const config = await prisma.planConfig.upsert({
        where: { plan },
        update: data,
        create: { plan, ...data }
    });
    revalidatePath("/admin");
    revalidatePath("/abonnement");
    return JSON.parse(JSON.stringify(config));
}

export async function getPlanStats() {
    await checkSuperAdmin();
    const plans = ["SOLO", "PRO", "CLINIQUE"] as const;
    const results = await Promise.all(
        plans.map(async (plan) => {
            const [activeCount, configs] = await Promise.all([
                prisma.abonnement.count({ where: { plan, statut: "ACTIF" } }),
                prisma.planConfig.findUnique({ where: { plan }, select: { prixMensuel: true } }),
            ]);
            return {
                plan,
                activeSubscribers: activeCount,
                monthlyRevenue: activeCount * (configs?.prixMensuel ?? 0),
            };
        })
    );
    return results;
}

// ============================================
// GESTION DES PROMOTIONS (CODES REDUCTION)
// ============================================
export async function getPromotions() {
    await checkSuperAdmin();
    const promotions = await prisma.promotion.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { usages: true } } },
    });
    return JSON.parse(JSON.stringify(promotions));
}

export async function createPromotion(data: {
    code: string;
    description?: string;
    type: "POURCENTAGE" | "MONTANT_FIXE";
    valeur: number;
    validUntil?: Date | null;
    usageLimit?: number | null;
    usagePerUser?: number | null;
    applicableTo?: string[];
}) {
    await checkSuperAdmin();
    const { applicableTo = [], ...rest } = data;
    const promo = await prisma.promotion.create({
        data: { ...rest, applicableTo },
    });
    revalidatePath("/admin");
    return JSON.parse(JSON.stringify(promo));
}

export async function updatePromotion(
    id: string,
    data: {
        active?: boolean;
        description?: string;
        valeur?: number;
        validUntil?: Date | null;
        usageLimit?: number | null;
        usagePerUser?: number | null;
        applicableTo?: string[];
    }
) {
    await checkSuperAdmin();
    const promo = await prisma.promotion.update({ where: { id }, data });
    revalidatePath("/admin");
    return JSON.parse(JSON.stringify(promo));
}

export async function deletePromotion(id: string) {
    await checkSuperAdmin();
    await prisma.promotion.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
}

// ============================================
// GESTION CATALOGUE CCAM
// ============================================
export async function getAllActesCCAM() {
    await checkSuperAdmin();
    const actes = await prisma.acteCCAM.findMany({ orderBy: { code: "asc" } });
    return JSON.parse(JSON.stringify(actes));
}

export async function updateActeCCAMAdmin(id: string, data: { active?: boolean; tarif?: number; libelle?: string }) {
    await checkSuperAdmin();
    const acte = await prisma.acteCCAM.update({ where: { id }, data });
    revalidatePath("/admin/super");
    return JSON.parse(JSON.stringify(acte));
}

// ============================================
// PARAMÈTRES GLOBAUX DE L'APPLICATION
// ============================================
export async function getAppSettings() {
    await checkSuperAdmin();
    let settings = await prisma.clinicSettings.findUnique({ where: { id: "singleton" } });
    if (!settings) {
        settings = await prisma.clinicSettings.create({ data: { id: "singleton" } });
    }
    return JSON.parse(JSON.stringify(settings));
}

export async function updateAppSettings(data: {
    clinicName?: string;
    address?: string;
    phone?: string;
    email?: string;
    currency?: string;
    requireApproval?: boolean;
    require2FAForAll?: boolean;
}) {
    await checkSuperAdmin();
    const updateData: any = {};
    if (data.clinicName !== undefined) updateData.nom = data.clinicName;
    if (data.address !== undefined) updateData.adresse = data.address;
    if (data.phone !== undefined) updateData.telephone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.requireApproval !== undefined) updateData.requireApproval = data.requireApproval;
    if (data.require2FAForAll !== undefined) updateData.require2FAForAll = data.require2FAForAll;

    // Note: currency is not in schema but we keep it in UI for now, ignored in DB update

    const settings = await prisma.clinicSettings.upsert({
        where: { id: "singleton" },
        update: updateData,
        create: { id: "singleton", ...updateData },
    });
    revalidatePath("/admin/super");
    revalidatePath("/dashboard");
    return settings;
}

// ============================================
// AUDIT LOGS
// ============================================
export async function getAuditLogs(limit = 50) {
    await checkSuperAdmin();
    const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { timestamp: "desc" },
    });
    return JSON.parse(JSON.stringify(logs));
}
// ============================================
// FONCTIONS PUBLIQUES (POUR LE PORTAIL PATIENT)
// ============================================

export async function getActiveDoctors() {
    try {
        const doctors: any[] = await prisma.$queryRaw`
            SELECT * FROM "User"
            WHERE role = 'MEDECIN'
              AND status = 'ACTIVE'
            ORDER BY name ASC
        `;
        return doctors;
    } catch (err) {
        console.error("getActiveDoctors Error:", err);
        return [];
    }
}

// ============================================
// GESTION DES PUBLICITÉS / CAMPAGNES (PARTENAIRES)
// ============================================
export async function getAdvertisements() {
    try {
        await checkSuperAdmin();
        const ads = await prisma.advertisement.findMany({ orderBy: { createdAt: "desc" } });
        return JSON.parse(JSON.stringify(ads));
    } catch (e) {
        console.error("SuperAdmin Ads Error:", e);
        return [];
    }
}

export async function createAdvertisement(data: {
    partenaire: string;
    titre: string;
    description?: string;
    imageUrl?: string;
    lienClick?: string;
    couleur?: string;
    formatCible?: string[];
    dateDebut: Date;
    dateFin: Date;
    prixParJour: number;
}) {
    await checkSuperAdmin();
    const diffTime = Math.abs(new Date(data.dateFin).getTime() - new Date(data.dateDebut).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const prixTotal = diffDays * data.prixParJour;
    const { formatCible = [], ...rest } = data;
    const ad = await prisma.advertisement.create({
        data: { ...rest, formatCible, dateDebut: new Date(data.dateDebut), dateFin: new Date(data.dateFin), prixTotal },
    });
    revalidatePath("/admin/super");
    revalidatePath("/abonnement");
    return JSON.parse(JSON.stringify(ad));
}

type AdUpdateInput = {
    partenaire?: string; titre?: string;
    description?: string | null; imageUrl?: string | null;
    lienClick?: string | null; couleur?: string | null;
    dateDebut?: Date | string; dateFin?: Date | string; prixParJour?: number;
    statut?: "ACTIF" | "PAUSE" | "TERMINE"; formatCible?: string[];
};

export async function updateAdvertisement(id: string, data: AdUpdateInput) {
    await checkSuperAdmin();
    const update: Record<string, unknown> = {};
    const allowed: (keyof AdUpdateInput)[] = [
        "partenaire", "titre", "description", "imageUrl", "lienClick",
        "couleur", "statut", "formatCible", "prixParJour", "dateDebut", "dateFin",
    ];
    for (const key of allowed) {
        if (data[key] !== undefined) update[key] = data[key];
    }
    if (update.dateDebut && !(update.dateDebut instanceof Date)) update.dateDebut = new Date(update.dateDebut as string);
    if (update.dateFin   && !(update.dateFin   instanceof Date)) update.dateFin   = new Date(update.dateFin as string);
    if (update.dateDebut && update.dateFin && update.prixParJour) {
        const diffTime = Math.abs((update.dateFin as Date).getTime() - (update.dateDebut as Date).getTime());
        update.prixTotal = (Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1) * (update.prixParJour as number);
    }
    const ad = await prisma.advertisement.update({ where: { id }, data: update });
    revalidatePath("/admin/super");
    revalidatePath("/abonnement");
    return JSON.parse(JSON.stringify(ad));
}

export async function deleteAdvertisement(id: string) {
    await checkSuperAdmin();
    await prisma.advertisement.delete({ where: { id } });
    revalidatePath("/admin/super");
    revalidatePath("/abonnement");
    return { success: true };
}

export async function trackAdImpression(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return;
    try {
        await prisma.advertisement.update({
            where: { id },
            data: { impressionCount: { increment: 1 } },
        });
    } catch { /* silencieux — ne pas casser l'UI */ }
}

export async function trackAdClick(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return;
    try {
        await prisma.advertisement.update({
            where: { id },
            data: { clickCount: { increment: 1 } },
        });
    } catch { /* silencieux */ }
}

// ============================================
// DEMANDES D'UPGRADE
// ============================================
export async function getUpgradeRequests() {
    await checkSuperAdmin();
    const demandes = await prisma.demandeUpgrade.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, email: true, clinicName: true } } },
    });
    return JSON.parse(JSON.stringify(demandes));
}

export async function approveUpgrade(demandeId: string, noteAdmin?: string) {
    await checkSuperAdmin();

    const demande = await prisma.demandeUpgrade.findUnique({
        where: { id: demandeId },
        include: { user: { select: { id: true, name: true, email: true, clinicName: true } } },
    });
    if (!demande) throw new Error("Demande introuvable");
    if (demande.statut !== "EN_ATTENTE") throw new Error("Demande déjà traitée");

    // Chercher l'abonnement existant (quel que soit son statut)
    const existingAb = await prisma.abonnement.findFirst({
        where: { userId: demande.userId },
        orderBy: { createdAt: "desc" },
    });

    let abonnement;
    if (existingAb) {
        abonnement = await prisma.abonnement.update({
            where: { id: existingAb.id },
            data: { plan: demande.planDemande, statut: "ACTIF" },
            include: { user: { select: { name: true, email: true, clinicName: true } } },
        });
    } else {
        abonnement = await prisma.abonnement.create({
            data: { userId: demande.userId, plan: demande.planDemande, statut: "ACTIF" },
            include: { user: { select: { name: true, email: true, clinicName: true } } },
        });
    }

    await prisma.$transaction([
        prisma.demandeUpgrade.update({
            where: { id: demandeId },
            data: { statut: "APPROUVE", noteAdmin: noteAdmin || null },
        }),
        prisma.notification.create({
            data: {
                userId: demande.userId,
                titre: "Upgrade d'abonnement approuvé ✓",
                message: `Votre passage au plan ${demande.planDemande} a été validé${noteAdmin ? ` : ${noteAdmin}` : "."} Bonne utilisation !`,
                type: "SUCCESS",
                link: "/abonnement",
            },
        }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/abonnement");
    return { success: true, abonnement: JSON.parse(JSON.stringify(abonnement)) };
}

export async function refuseUpgrade(demandeId: string, noteAdmin?: string) {
    await checkSuperAdmin();

    const demande = await prisma.demandeUpgrade.findUnique({
        where: { id: demandeId },
    });
    if (!demande) throw new Error("Demande introuvable");
    if (demande.statut !== "EN_ATTENTE") throw new Error("Demande déjà traitée");

    await prisma.$transaction([
        prisma.demandeUpgrade.update({
            where: { id: demandeId },
            data: { statut: "REFUSE", noteAdmin: noteAdmin || null },
        }),
        prisma.notification.create({
            data: {
                userId: demande.userId,
                titre: "Demande d'upgrade non retenue",
                message: noteAdmin
                    ? `Votre demande de passage au plan ${demande.planDemande} n'a pas été retenue : ${noteAdmin}`
                    : `Votre demande de passage au plan ${demande.planDemande} n'a pas été retenue. Contactez le support pour plus d'informations.`,
                type: "WARNING",
                link: "/abonnement",
            },
        }),
    ]);

    revalidatePath("/admin");
    revalidatePath("/abonnement");
    return { success: true };
}
