"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Récupère les paramètres du cabinet
 */
export async function getClinicSettings() {
    let settings = await prisma.clinicSettings.findUnique({
        where: { id: "singleton" }
    });

    if (!settings) {
        // Initialisation si inexistant
        settings = await prisma.clinicSettings.create({
            data: {
                id: "singleton",
                nom: "Gynaeasy Clinic",
                adresse: "Dakar, Sénégal",
                telephone: "+221 33 000 00 00",
                email: "contact@gynaeasy.com"
            }
        });
    }

    return settings;
}

/**
 * Met à jour les paramètres du cabinet
 */
export async function updateClinicSettings(data: {
    nom: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    slogan?: string;
}) {
    const settings = await prisma.clinicSettings.upsert({
        where: { id: "singleton" },
        update: data,
        create: {
            id: "singleton",
            ...data
        }
    });

    revalidatePath("/parametres");
    // On revalide aussi les pages qui utilisent ces infos (dashboard, etc.)
    revalidatePath("/facturation");
    revalidatePath("/imagerie");

    return { success: true, settings };
}
