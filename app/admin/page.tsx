import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    getSuperAdminStats,
    getAllUsers,
    getAllAbonnements,
    getAllActesCCAM,
    getAppSettings,
    getAuditLogs,
    getPlanConfigs,
    getPromotions,
    getAdvertisements
} from "@/app/actions/superadmin";
import { getPendingRegistrations } from "@/app/actions/onboarding";
import SuperAdminClient from "./super-admin-client";

export const metadata = {
    title: "Super Admin — Gynaeasy SaaS",
    description: "Tableau de bord d'administration globale",
};

export default async function SuperAdminPage() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/dashboard");
    }

    const data = await Promise.all([
        getSuperAdminStats(),
        getAllUsers(),
        getAllAbonnements(),
        getAllActesCCAM(),
        getAppSettings(),
        getAuditLogs(30),
        getPlanConfigs(),
        getPromotions(),
        getPendingRegistrations(),
        getAdvertisements(),
    ]);

    // Sérialisation forcée pour éviter les erreurs RSC en production
    const [stats, users, abonnements, actes, settings, auditLogs, planConfigs, promotions, pendingUsers, advertisements] = JSON.parse(JSON.stringify(data));

    return (
        <SuperAdminClient
            stats={stats}
            users={users}
            abonnements={abonnements}
            actes={actes}
            settings={settings}
            auditLogs={auditLogs}
            planConfigs={planConfigs}
            promotions={promotions}
            pendingUsers={pendingUsers}
            advertisements={advertisements}
            adminEmail={session.user?.email || ""}
        />
    );
}
