"use server";

import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { sendWhatsApp } from "@/lib/whatsapp";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";

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

    return await prisma.patient.findMany({
        where: {
            ...(role === "MEDECIN" ? { treatingDoctorId: userId } : {}),
            telephone: { not: null, notIn: [""] },
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            telephone: true,
            civilite: true,
        },
        orderBy: { nom: "asc" },
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

    // Ownership: MEDECIN limited to own patients, SECRETAIRE/ADMIN see all
    const patients = await prisma.patient.findMany({
        where: {
            id: { in: patientIds },
            ...(role === "MEDECIN" ? { treatingDoctorId: userId } : {}),
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

    const patients = await prisma.patient.findMany({
        where: {
            id: { in: patientIds },
            ...(role === "MEDECIN" ? { treatingDoctorId: userId } : {}),
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
            const mode = res.simulated ? "MODE SIMULATION" : "MODE RÉEL ORANGE";
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
 * Récupère les statistiques et le solde (contrats) Orange SMS
 */
export async function getOrangeSMSStats() {
    try {
        const clientId = process.env.ORANGE_SMS_CLIENT_ID;
        const clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET;
        if (!clientId || !clientSecret) return { success: false, error: "Clés non configurées" };

        // 1. Obtenir le token (v3)
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenResponse = await fetch("https://api.orange.com/oauth/v3/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });

        if (!tokenResponse.ok) throw new Error("Impossible d'obtenir le token Orange.");
        const { access_token } = await tokenResponse.json();

        // 2. Récupérer les stats d'usage
        const statsResponse = await fetch("https://api.orange.com/sms/admin/v1/statistics", {
            headers: { "Authorization": `Bearer ${access_token}` }
        });
        const statsData = statsResponse.ok ? await statsResponse.json() : null;

        // 3. Récupérer le solde (contracts)
        const contractsResponse = await fetch("https://api.orange.com/sms/admin/v1/contracts", {
            headers: { "Authorization": `Bearer ${access_token}` }
        });
        const contractsRaw = contractsResponse.ok ? await contractsResponse.json() : null;

        // Orange returns either an array directly or wrapped — normalize it
        const contractsList: any[] = Array.isArray(contractsRaw)
            ? contractsRaw
            : Array.isArray(contractsRaw?.contracts)
                ? contractsRaw.contracts
                : Array.isArray(contractsRaw?.partnerContracts?.contracts)
                    ? contractsRaw.partnerContracts.contracts
                    : [];

        const activeContracts = contractsList.filter((c: any) => c.status === "ACTIVE");
        const availableUnits = activeContracts.reduce((acc: number, c: any) => acc + (c.availableUnits || 0), 0);
        const expirationDate = activeContracts[0]?.expirationDate ?? null;
        const country = activeContracts[0]?.country ?? null;

        // Normalize usage: try multiple known Orange response shapes
        const smsSent = statsData?.partnerStatistics?.statistics?.[0]?.serviceStatistics?.[0]?.countryStatistics?.[0]?.usage
            ?? statsData?.statistics?.[0]?.usage
            ?? statsData?.usage
            ?? 0;

        return {
            success: true,
            availableUnits,
            expirationDate,
            country,
            smsSent,
        };
    } catch (error: any) {
        console.error("Orange SMS API Error:", error);
        return { success: false, error: error.message };
    }
}
