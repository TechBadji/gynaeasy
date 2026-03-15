import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize the Twilio client using environment variables
// Ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(req: Request) {
    try {
        const { to, dateHeure, patientNom } = await req.json();

        if (!to || !dateHeure || !patientNom) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!client) {
            console.warn("[SMS] Twilio not configured. Simulating SMS to", to);
            return NextResponse.json({ success: true, simulated: true });
        }

        const formattedDate = new Date(dateHeure).toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const message = `Bonjour Mme ${patientNom}, le Dr LEYDIER vous rappelle votre RDV le ${formattedDate}. En cas d'empêchement, merci d'annuler 48h à l'avance.`;

        const sms = await client.messages.create({
            body: message,
            from: fromPhone,
            to: to, // Must be in E.164 format e.g. +33612345678
        });

        return NextResponse.json({ success: true, messageId: sms.sid });
    } catch (error) {
        console.error("SMS Error:", error);
        return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
    }
}
