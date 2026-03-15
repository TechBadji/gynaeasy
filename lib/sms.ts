"use server";

/**
 * Service de simulation d'envoi de SMS (à remplacer par Twilio ou Infobip en production)
 */
export async function sendSMS(to: string, message: string) {
    console.log(`[SIMULATION SMS] Vers: ${to} | Message: ${message}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // En production, vous feriez ceci :
    /*
    const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: to
    });
    */

    return { success: true };
}
