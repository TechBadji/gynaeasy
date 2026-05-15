"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const VALID_TYPES = ["CONSULTATION", "ECHOGRAPHIE", "URGENCE", "SUIVI_GROSSESSE", "TELECONSULTATION"] as const;

export async function validatePatientPhone(phone: string) {
    const patient = await prisma.patient.findFirst({
        where: { telephone: phone },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
        }
    });
    return patient;
}

export async function validatePatientCode(code: string) {
    const patient = await prisma.patient.findFirst({
        where: { codePatient: code },
        select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            codePatient: true,
        }
    });
    return patient;
}

export async function createOnlineAppointment(patientId: string, doctorId: string, dateHeure: string, type: string) {
    try {
        if (!VALID_TYPES.includes(type as any)) {
            return { success: false, message: "Type de rendez-vous invalide" };
        }

        const dt = new Date(dateHeure);
        if (isNaN(dt.getTime()) || dt <= new Date()) {
            return { success: false, message: "Date invalide ou dans le passé" };
        }

        const doctor = await prisma.user.findUnique({
            where: { id: doctorId },
            select: { role: true, status: true }
        });
        if (!doctor || doctor.role !== "MEDECIN" || doctor.status !== "ACTIVE") {
            return { success: false, message: "Médecin introuvable ou inactif" };
        }

        const appointment = await prisma.consultation.create({
            data: {
                patientId,
                userId: doctorId,
                dateHeure: dt,
                type: type as any,
                source: "ONLINE",
            },
            include: {
                patient: true,
                user: true
            }
        });

        // Notifications
        const { sendSMS } = await import("@/lib/sms");
        const { sendWhatsApp } = await import("@/lib/whatsapp");
        const { sendBookingNotificationEmail } = await import("@/lib/mail");
        const { format } = await import("date-fns");
        const { fr } = await import("date-fns/locale");

        const dt = new Date(dateHeure);
        const dateStr = format(dt, "dd/MM/yyyy", { locale: fr });
        const timeStr = format(dt, "HH:mm", { locale: fr });

        // SMS & WhatsApp
        if (appointment.patient.telephone) {
            const msg = `Confirmation: RDV avec le ${appointment.user.name} le ${dateStr} à ${timeStr}. Merci d'être à l'heure. Gynaeasy`;
            await sendSMS(appointment.patient.telephone, msg);
            await sendWhatsApp(appointment.patient.telephone, `✅ *CONFIRMATION RDV*\n\nBonjour, votre rendez-vous avec le *${appointment.user.name}* est confirmé pour le :\n\n📅 *${dateStr}*\n⏰ *${timeStr}*\n\nMerci de nous prévenir en cas d'annulation. Gynaeasy.`);
        }

        // Email
        if (appointment.patient.email) {
            await sendBookingNotificationEmail(
                appointment.patient.email,
                appointment.patient.nom.toUpperCase(),
                appointment.user.name || "Médecin",
                dateStr,
                timeStr
            );
        }

        revalidatePath("/booking");
        revalidatePath("/dashboard");

        return { success: true, appointment };
    } catch (error: any) {
        console.error("[createOnlineAppointment]:", error);
        return { success: false, message: "Une erreur est survenue lors de la réservation" };
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
