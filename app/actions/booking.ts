"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function validatePatientCode(code: string) {
    const patient = await prisma.patient.findUnique({
        where: { codePatient: code },
        select: {
            id: true,
            nom: true,
            prenom: true,
            codePatient: true,
        }
    });
    return patient;
}

export async function createOnlineAppointment(patientId: string, doctorId: string, dateHeure: string, type: string) {
    try {
        const appointment = await prisma.consultation.create({
            data: {
                patientId,
                userId: doctorId,
                dateHeure: new Date(dateHeure),
                type: type as any,
                source: "ONLINE",
            }
        });

        revalidatePath("/booking");
        revalidatePath("/dashboard"); // Pour que le médecin voit le rdv

        return { success: true, appointment };
    } catch (error: any) {
        console.error("Booking error:", error);
        return { success: false, message: error.message };
    }
}

export async function getDoctorAppointments(doctorId: string) {
    return await prisma.consultation.findMany({
        where: {
            userId: doctorId,
            dateHeure: {
                gte: new Date(), // RDV à venir
            }
        },
        select: {
            dateHeure: true,
            duree: true,
        }
    });
}
