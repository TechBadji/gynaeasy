import { NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    try {
        const { to, dateHeure, patientNom } = await req.json();

        if (!to || !dateHeure || !patientNom) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const formattedDate = format(new Date(dateHeure), "eeee d MMMM yyyy à HH:mm", { locale: fr });
        const message = `Bonjour Mme ${patientNom}, le cabinet Gynaeasy vous rappelle votre RDV le ${formattedDate}. Merci d'annuler 24h à l'avance en cas d'empêchement.`;

        const res = await sendSMS(to, message);

        if (res.success) {
            return NextResponse.json({ 
                success: true, 
                messageId: (res as any).messageId, 
                simulated: (res as any).simulated 
            });
        } else {
            return NextResponse.json({ 
                error: (res as any).error || "Failed to send SMS" 
            }, { status: 500 });
        }
    } catch (error) {
        console.error("SMS Error:", error);
        return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
    }
}
