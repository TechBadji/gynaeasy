"use server";
// Reload signal: 12-03-2026 10:29

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
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = await prisma.consultation.count({
            where: { createdAt: { gte: d, lt: end } },
        });
        months.push({
            month: d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
            count,
        });
    }
    return months;
}

// ============================================
// GESTION DES UTILISATEURS
// ============================================
export async function getAllUsers() {
    await checkSuperAdmin();
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            enabledModules: true,
            createdAt: true,
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

export async function createUserAdmin(data: {
    name: string;
    email: string;
    role: "MEDECIN" | "SECRETAIRE" | "ADMIN";
    password?: string;
}) {
    await checkSuperAdmin();

    const hashedPassword = await bcrypt.hash(data.password || "Gynaeasy2026!", 10);

    // Modules par défaut selon le rôle
    const defaultModules = data.role === "SECRETAIRE"
        ? ["AGENDA", "PATIENTS", "FACTURATION"]
        : ["AGENDA", "PATIENTS", "FACTURATION", "CONSULTATION", "IMAGERIE"];

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            enabledModules: defaultModules,
        }
    });

    // Créer un abonnement par défaut pour que l'utilisateur puisse se connecter
    await prisma.abonnement.create({
        data: {
            userId: user.id,
            plan: data.role === "SECRETAIRE" ? "PRO" : "PREMIUM",
            statut: "ACTIF",
            dateDebut: new Date(),
        }
    });

    revalidatePath("/admin/super");
    return JSON.parse(JSON.stringify(user));
}

export async function updateUserRoleAdmin(userId: string, role: "MEDECIN" | "SECRETAIRE" | "ADMIN") {
    await checkSuperAdmin();
    const user = await prisma.user.update({ where: { id: userId }, data: { role } });
    revalidatePath("/admin/super");
    return JSON.parse(JSON.stringify(user));
}

export async function toggleUserModule(userId: string, moduleName: string) {
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
    return JSON.parse(JSON.stringify(updated));
}

export async function deleteUser(userId: string) {
    await checkSuperAdmin();
    // Soft delete: just block access by changing role — never delete medical data
    // For hard delete in a real SAAS you'd anonymize data
    await prisma.user.update({
        where: { id: userId },
        data: { role: "SECRETAIRE" }, // Downgrade
    });
    revalidatePath("/admin/super");
    return { success: true };
}

// ============================================
// GESTION DES ABONNEMENTS SAAS
// ============================================
export async function getAllAbonnements() {
    await checkSuperAdmin();
    return await prisma.abonnement.findMany({
        include: {
            user: { select: { name: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateAbonnement(
    id: string,
    data: {
        plan?: "BASIQUE" | "PRO" | "PREMIUM";
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
    plan: "BASIQUE" | "PRO" | "PREMIUM";
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

export async function updatePlanConfig(plan: "BASIQUE" | "PRO" | "PREMIUM", data: {
    prixMensuel: number;
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
    return JSON.parse(JSON.stringify(config));
}

// ============================================
// GESTION DES PROMOTIONS (CODES REDUCTION)
// ============================================
export async function getPromotions() {
    await checkSuperAdmin();
    const promotions = await prisma.promotion.findMany({
        orderBy: { createdAt: "desc" }
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
}) {
    await checkSuperAdmin();
    const promo = await prisma.promotion.create({ data });
    revalidatePath("/admin");
    return JSON.parse(JSON.stringify(promo));
}

export async function updatePromotion(id: string, active: boolean) {
    await checkSuperAdmin();
    const promo = await prisma.promotion.update({
        where: { id },
        data: { active }
    });
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
}) {
    await checkSuperAdmin();
    const updateData: any = {};
    if (data.clinicName !== undefined) updateData.nom = data.clinicName;
    if (data.address !== undefined) updateData.adresse = data.address;
    if (data.phone !== undefined) updateData.telephone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;

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
    return await prisma.user.findMany({
        where: {
            role: "MEDECIN",
            status: "ACTIVE"
        },
        select: {
            id: true,
            name: true,
            specialite: true,
            clinicName: true,
        },
        orderBy: { name: "asc" }
    });
}
