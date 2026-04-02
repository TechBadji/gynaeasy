"use server";

import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";
import { format } from "date-fns";

export async function getRemindersCount(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const count = await (prisma.consultation as any).count({
        where: {
            dateHeure: { gte: start, lte: end },
            smsReminded: false,
            patient: { telephone: { not: null } }
        }
    });

    return count;
}

export async function sendDailyReminders(date: Date) {
    try {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const appointments = await (prisma.consultation as any).findMany({
            where: {
                dateHeure: { gte: start, lte: end },
                smsReminded: false,
                patient: { 
                    telephone: { 
                        not: null,
                        notIn: [""]
                    } 
                }
            },
            include: {
                patient: { select: { nom: true, prenom: true, telephone: true, civilite: true } },
                user: { select: { name: true } }
            }
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
                await (prisma.consultation as any).update({
                    where: { id: appt.id },
                    data: { smsReminded: true }
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
        const statsResponse = await fetch("https://api.orange.com/sms/admin/v1/statistics?country=SEN", {
            headers: { "Authorization": `Bearer ${access_token}` }
        });
        const statsData = statsResponse.ok ? await statsResponse.json() : null;

        // 3. Récupérer le solde (contracts) sans filtre de pays pour être plus large
        const contractsResponse = await fetch("https://api.orange.com/sms/admin/v1/contracts", {
            headers: { "Authorization": `Bearer ${access_token}` }
        });
        const contractsData = contractsResponse.ok ? await contractsResponse.json() : null;
        
        return {
            success: true, 
            usage: statsData,
            contracts: contractsData 
        };
    } catch (error: any) {
        console.error("Orange SMS API Error:", error);
        return { success: false, error: error.message };
    }
}
