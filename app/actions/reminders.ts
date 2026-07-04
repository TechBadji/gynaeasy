"use server";

import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { sendWhatsApp } from "@/lib/whatsapp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { getEffectiveDoctorId } from "@/lib/effective-user";

export async function getRemindersCount(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const count = await prisma.consultation.count({
        where: {
            dateHeure: { gte: start, lte: end },
            smsReminded: false,
            patient: { telephone: { not: null } },
        },
    });

    return count;
}

export async function sendDailyReminders(date: Date) {
    try {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const appointments = await prisma.consultation.findMany({
            where: {
                dateHeure: { gte: start, lte: end },
                smsReminded: false,
                patient: { telephone: { not: null, notIn: [""] } },
            },
            include: {
                patient: { select: { nom: true, prenom: true, telephone: true, civilite: true } },
                user:    { select: { name: true } },
            },
        });

        if (appointments.length === 0) {
            return { success: true, count: 0, message: "Aucun rappel à envoyer pour cette date." };
        }

        let sent = 0;
        let errors = 0;

        for (const appt of appointments) {
            const formattedTime = format(new Date(appt.dateHeure), "HH:mm");
            const dateStr = format(new Date(appt.dateHeure), "dd/MM/yyyy");
            
            const message = `Bonjour ${appt.patient.civilite} ${appt.patient.nom.toUpperCase()}, rappel de votre RDV le ${dateStr} à ${formattedTime} avec le ${appt.user.name}. Merci d'annuler 24h à l'avance en cas d'empêchement.`;

            const res = await sendSMS(appt.patient.telephone!, message);
            
            if (res.success) {
                await prisma.consultation.update({
                    where: { id: appt.id },
                    data:  { smsReminded: true },
                });
                sent++;
            } else {
                errors++;
            }
        }

        return { 
            success: true, 
            count: sent, 
            errors,
            message: `${sent} rappels envoyés.${errors > 0 ? ` (${errors} erreurs)` : ""}` 
        };
    } catch (error: any) {
        console.error("Reminder Action Error:", error);
        return { success: false, message: "Erreur lors de l'envoi des rappels." };
    }
}

export async function getPatientsBroadcastList() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!["MEDECIN", "SECRETAIRE", "ADMIN"].includes(role)) return [];

    const doctorId = await getEffectiveDoctorId(userId, role);

    const patients = await prisma.patient.findMany({
        where: {
            ...(role !== "ADMIN" ? { treatingDoctorId: doctorId } : {}),
            telephone: { not: null, notIn: [""] },
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            civilite: true,
            consultations: {
                where: { dateHeure: { gte: new Date() } },
                orderBy: { dateHeure: "asc" },
                take: 1,
                select: { dateHeure: true },
            },
        },
        orderBy: { nom: "asc" },
    });

    return patients.map(p => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        telephone: p.telephone,
        civilite: p.civilite,
        prochainRdv: p.consultations[0]?.dateHeure ?? null,
    }));
}

export async function getRemindersForDate(date: Date) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return await prisma.consultation.findMany({
        where: {
            dateHeure: { gte: start, lte: end },
            smsReminded: false,
            patient: {
                telephone: { not: null, notIn: [""] },
                ...(role === "MEDECIN" ? { treatingDoctorId: userId } : {}),
            },
        },
        select: {
            id: true,
            dateHeure: true,
            motif: true,
            patient: { select: { nom: true, prenom: true, civilite: true, telephone: true } },
        },
        orderBy: { dateHeure: "asc" },
    });
}

export async function broadcastSMS(patientIds: string[], message: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, message: "Non authentifié" };

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!["MEDECIN", "SECRETAIRE", "ADMIN"].includes(role)) {
        return { success: false, message: "Accès refusé" };
    }

    const msg = message?.trim();
    if (!msg || msg.length > 480) {
        return { success: false, message: "Message invalide (1–480 caractères)" };
    }

    if (!Array.isArray(patientIds) || patientIds.length === 0 || patientIds.length > 500) {
        return { success: false, message: "Sélection invalide" };
    }

    const doctorId = await getEffectiveDoctorId(userId, role);

    // Ownership: MEDECIN et SECRETAIRE filtrés sur leur médecin, ADMIN voit tout
    const patients = await prisma.patient.findMany({
        where: {
            id: { in: patientIds },
            ...(role !== "ADMIN" ? { treatingDoctorId: doctorId } : {}),
            telephone: { not: null, notIn: [""] },
        },
        select: { id: true, nom: true, telephone: true },
    });

    if (!patients.length) {
        return { success: false, message: "Aucun patient éligible trouvé" };
    }

    let sent = 0;
    let errors = 0;

    for (const patient of patients) {
        const res = await sendSMS(patient.telephone!, msg);
        if (res.success) sent++;
        else errors++;
    }

    return {
        success: true,
        sent,
        errors,
        message: `${sent} SMS envoyé${sent > 1 ? "s" : ""}.${errors > 0 ? ` ${errors} échec(s).` : ""}`,
    };
}

export async function broadcastMessage(
    patientIds: string[],
    message: string,
    channels: ("sms" | "whatsapp")[],
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, message: "Non authentifié" };

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (!["MEDECIN", "SECRETAIRE", "ADMIN"].includes(role)) {
        return { success: false, message: "Accès refusé" };
    }

    const msg = message?.trim();
    if (!msg || msg.length > 480) {
        return { success: false, message: "Message invalide (1–480 caractères)" };
    }

    if (!Array.isArray(patientIds) || patientIds.length === 0 || patientIds.length > 500) {
        return { success: false, message: "Sélection invalide" };
    }

    if (!channels.length) return { success: false, message: "Aucun canal sélectionné" };

    const doctorId = await getEffectiveDoctorId(userId, role);

    const patients = await prisma.patient.findMany({
        where: {
            id: { in: patientIds },
            ...(role !== "ADMIN" ? { treatingDoctorId: doctorId } : {}),
            telephone: { not: null, notIn: [""] },
        },
        select: { id: true, nom: true, telephone: true },
    });

    if (!patients.length) return { success: false, message: "Aucun patient éligible trouvé" };

    let smsSent = 0, smsErrors = 0, waSent = 0, waErrors = 0;

    for (const patient of patients) {
        const tel = patient.telephone!;
        if (channels.includes("sms")) {
            const r = await sendSMS(tel, msg);
            if (r.success) smsSent++; else smsErrors++;
        }
        if (channels.includes("whatsapp")) {
            const r = await sendWhatsApp(tel, msg);
            if (r.success) waSent++; else waErrors++;
        }
    }

    const parts: string[] = [];
    if (channels.includes("sms")) parts.push(`SMS : ${smsSent} envoyé${smsSent > 1 ? "s" : ""}${smsErrors > 0 ? ` (${smsErrors} échec${smsErrors > 1 ? "s" : ""})` : ""}`);
    if (channels.includes("whatsapp")) parts.push(`WhatsApp : ${waSent} envoyé${waSent > 1 ? "s" : ""}${waErrors > 0 ? ` (${waErrors} échec${waErrors > 1 ? "s" : ""})` : ""}`);

    return {
        success: true,
        smsSent,
        smsErrors,
        waSent,
        waErrors,
        message: parts.join(" — "),
    };
}

export async function sendTestSMS(to: string, message: string) {
    try {
        const res = await sendSMS(to, message);
        if (res.success) {
            const mode = res.simulated ? "MODE SIMULATION" : "MODE RÉEL LAM";
            return {
                success: true,
                message: `SMS de test envoyé avec succès ! (${mode})`,
                messageId: res.messageId,
                debug: (res as any).debug ?? null,
            };
        } else {
            return {
                success: false,
                message: (res as any).error || "L'envoi a échoué.",
                debug: (res as any).debug ?? null,
            };
        }
    } catch (error: any) {
        return { success: false, message: error.message, debug: null };
    }
}

/**
 * Statistiques des rappels SMS depuis la base de données (tous clients)
 */
export async function getReminderStats() {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);           // 1er du mois
    const tom0  = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0,  0,  0);
    const tom23 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59);

    const [totalMonth, totalAll, pendingTomorrow] = await Promise.all([
        prisma.consultation.count({ where: { smsReminded: true, dateHeure: { gte: start } } }),
        prisma.consultation.count({ where: { smsReminded: true } }),
        prisma.consultation.count({
            where: {
                smsReminded: false,
                dateHeure: { gte: tom0, lte: tom23 },
                patient: { telephone: { not: null, notIn: [""] } },
            },
        }),
    ]);

    return {
        totalMonth,
        totalAll,
        pendingTomorrow,
        cronConfigured: !!process.env.CRON_SECRET,
        lamConfigured:  !!(process.env.LAM_ACCESS_KEY && process.env.LAM_ACCESS_PASSWORD),
    };
}
