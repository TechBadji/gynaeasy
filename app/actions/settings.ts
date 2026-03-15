"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Use dynamic client instantiation to bypass dev mode caching
async function getPrisma() {
    const { PrismaClient } = await import("@prisma/client");
    const p = new PrismaClient();
    return p as any;
}

// Use string for Role to avoid import issues if client generation is pending
type Role = "MEDECIN" | "SECRETAIRE" | "ADMIN";

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        throw new Error("Non autorisé : Accès administrateur requis");
    }
    return session;
}

export async function getSettings() {
    const p = await getPrisma();

    // Normal way if model exists
    if (p.appSettings) {
        let settings = await p.appSettings.findUnique({
            where: { id: "singleton" }
        });

        if (!settings) {
            settings = await p.appSettings.create({
                data: { id: "singleton" }
            });
        }

        return settings;
    }

    // Raw SQL fallback for dev-mode schema sync issues
    try {
        const rows: any[] = await p.$queryRaw`SELECT * FROM "AppSettings" WHERE id = 'singleton' LIMIT 1`;
        if (rows.length > 0) return rows[0];

        await p.$executeRaw`INSERT INTO "AppSettings" (id, "clinicName", currency, "updatedAt") VALUES ('singleton', 'Gynaeasy', 'FCFA', NOW())`;
        const newRows: any[] = await p.$queryRaw`SELECT * FROM "AppSettings" WHERE id = 'singleton' LIMIT 1`;
        return newRows[0];
    } catch (error) {
        console.error("Raw query failed:", error);
        throw new Error("Modèle AppSettings manquant et fallback SQL échoué. Redémarrez 'npm run dev'.");
    }
}

export async function updateSettings(data: {
    clinicName?: string;
    address?: string;
    phone?: string;
    email?: string;
    currency?: string;
}) {
    await checkAdmin();
    const p = await getPrisma();

    if (p.appSettings) {
        const settings = await p.appSettings.upsert({
            where: { id: "singleton" },
            update: data,
            create: { id: "singleton", ...data }
        });

        revalidatePath("/admin");
        revalidatePath("/dashboard");
        return settings;
    }

    // Raw SQL Fallback
    const keys = Object.keys(data).filter(k => (data as any)[k] !== undefined);
    if (keys.length > 0) {
        const setClause = keys.map(k => `"${k}" = '${(data as any)[k]}'`).join(', ');
        await p.$executeRawUnsafe(`UPDATE "AppSettings" SET ${setClause}, "updatedAt" = NOW() WHERE id = 'singleton'`);
    }

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return await getSettings();
}

export async function getUsers() {
    await checkAdmin();
    const p = await getPrisma();
    return await p.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" }
    });
}

export async function updateUserRole(userId: string, role: Role) {
    await checkAdmin();
    const p = await getPrisma();

    const user = await p.user.update({
        where: { id: userId },
        data: { role }
    });

    revalidatePath("/admin");
    return user;
}

export async function getActesCCAM() {
    await checkAdmin();
    const p = await getPrisma();
    return await p.acteCCAM.findMany({
        orderBy: { code: "asc" }
    });
}

export async function updateActeCCAM(id: string, data: { active?: boolean, tarif?: number }) {
    await checkAdmin();
    const p = await getPrisma();

    const acte = await p.acteCCAM.update({
        where: { id },
        data
    });

    revalidatePath("/admin");
    return acte;
}
