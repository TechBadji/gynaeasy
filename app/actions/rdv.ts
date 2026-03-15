"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RdvSchema = z.object({
    patientId: z.string().min(1, "Veuillez sélectionner un patient"),
    date: z.string().min(1, "Date requise"),
    heureDebut: z.string().min(1, "Heure de début requise"),
    duree: z.string().min(1, "Durée requise"),
    type: z.enum(["CONSULTATION", "ECHOGRAPHIE", "URGENCE", "SUIVI_GROSSESSE", "TELECONSULTATION"]),
    motif: z.string().optional().or(z.literal("")),
});

export type RdvFormState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

export async function createRdv(formData: FormData): Promise<RdvFormState> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, message: "Non authentifié" };
    }
    const userId = (session.user as any).id;
    if (!userId) {
        return { success: false, message: "Session invalide. Reconnectez-vous." };
    }

    const raw = {
        patientId: formData.get("patientId"),
        date: formData.get("date"),
        heureDebut: formData.get("heureDebut"),
        duree: formData.get("duree"),
        type: formData.get("type"),
        motif: formData.get("motif"),
    };

    const parsed = RdvSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            success: false,
            message: "Erreur de validation",
            errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
        };
    }

    const data = parsed.data;

    // Build DateTime from date + time
    const [year, month, day] = data.date.split("-").map(Number);
    const [hour, minute] = data.heureDebut.split(":").map(Number);
    const dateHeure = new Date(year, month - 1, day, hour, minute);
    const dureeMin = parseInt(data.duree);

    try {
        await prisma.consultation.create({
            data: {
                patientId: data.patientId,
                userId,
                dateHeure,
                duree: dureeMin,
                type: data.type as any,
                motif: data.motif || null,
            },
        });

        revalidatePath("/agenda");
        return { success: true, message: "Rendez-vous créé avec succès" };
    } catch (error: any) {
        console.error("Erreur création RDV:", error);
        return { success: false, message: `Erreur : ${error?.message || "Erreur inconnue"}` };
    }
}

export async function getPatients() {
    return prisma.patient.findMany({
        select: { id: true, nom: true, prenom: true, civilite: true },
        orderBy: { nom: "asc" },
    });
}
