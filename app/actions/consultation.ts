"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DonneesMedicalesSchema = z.record(z.string(), z.unknown());

export async function updateConsultationMedicalData(
    consultationId: string,
    donneesMedicales: unknown
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, message: "Non autorisé" };
    }

    const parsed = DonneesMedicalesSchema.safeParse(donneesMedicales);
    if (!parsed.success) {
        return { success: false, message: "Données médicales invalides" };
    }

    try {
        const consultation = await prisma.consultation.findUnique({
            where: { id: consultationId },
            select: { patientId: true }
        });

        if (!consultation) {
            return { success: false, message: "Consultation introuvable" };
        }

        await prisma.consultation.update({
            where: { id: consultationId },
            data: {
                donneesMedicales: parsed.data as any
            }
        });

        revalidatePath(`/patients/${consultation.patientId}`);

        return { success: true, message: "Dossier médical mis à jour" };
    } catch (error: any) {
        console.error("Error updating medical data:", error);
        return { success: false, message: error.message || "Erreur lors de la sauvegarde" };
    }
}

export async function createEmptyConsultation(patientId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return { success: false, message: "Non autorisé" };
    }

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return { success: false, message: "Utilisateur introuvable" };

        const consultation = await prisma.consultation.create({
            data: {
                patientId,
                userId: user.id,
                dateHeure: new Date(),
                type: "CONSULTATION",
                motif: "Consultation du jour",
            }
        });

        revalidatePath(`/patients/${patientId}`);

        return { success: true, consultationId: consultation.id };
    } catch (error: any) {
        console.error("Error creating empty consultation:", error);
        return { success: false, message: error.message || "Erreur lors de la création" };
    }
}
