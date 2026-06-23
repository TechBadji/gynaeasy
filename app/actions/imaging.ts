"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveImagingReport(documentId: string, description: string, metadata: any) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "MEDECIN") {
        throw new Error("Seuls les médecins peuvent rédiger des comptes-rendus");
    }

    const updated = await prisma.document.update({
        where: { id: documentId },
        data: { description, metadata: metadata || {} }
    });

    revalidatePath("/imagerie");
    return { success: true, document: updated };
}

export async function saveImagingCliche(documentId: string, url: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "MEDECIN") {
        throw new Error("Non autorisé");
    }

    await prisma.document.update({
        where: { id: documentId },
        data: { url },
    });

    revalidatePath("/imagerie");
    return { success: true };
}

export async function createImagingExam(data: {
    patientId: string;
    nom: string;
    notes?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "MEDECIN") {
        throw new Error("Non autorisé");
    }

    const userId = (session.user as any).id;

    const patient = await prisma.patient.findFirst({
        where: { id: data.patientId, treatingDoctorId: userId },
        select: { id: true },
    });
    if (!patient) throw new Error("Patient introuvable");

    const doc = await prisma.document.create({
        data: {
            patientId: data.patientId,
            nom: data.nom,
            type: "ECHOGRAPHIE",
            url: "",
            description: data.notes || "",
            metadata: {},
        },
        include: {
            patient: {
                select: { id: true, nom: true, prenom: true, codePatient: true, civilite: true },
            },
        },
    });

    revalidatePath("/imagerie");
    return { success: true, document: doc };
}
