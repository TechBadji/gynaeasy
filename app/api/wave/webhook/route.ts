import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWaveWebhookSignature } from "@/lib/wave";
import { StatutPaiement } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Wave envoie les événements en POST JSON
// Headers: wave-signature: sha256=<hmac>
export async function POST(req: NextRequest) {
    const rawBody  = await req.text();
    const signature = req.headers.get("wave-signature") ?? "";

    // Vérifier la signature (skip si WAVE_WEBHOOK_SECRET non configuré)
    if (process.env.WAVE_WEBHOOK_SECRET) {
        const valid = await verifyWaveWebhookSignature(rawBody, signature);
        if (!valid) {
            console.warn("[Wave Webhook] Signature invalide");
            return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
        }
    }

    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    // Événement de paiement confirmé
    if (event.type === "checkout.session.completed") {
        const sessionId = event.data?.id as string | undefined;
        if (sessionId) {
            await prisma.reglement.updateMany({
                where: { reference: sessionId, statut: "EN_ATTENTE" },
                data:  { statut: StatutPaiement.PAYE, dateReglement: new Date() },
            });
            revalidatePath("/facturation");
            revalidatePath("/dashboard");
            console.log(`[Wave Webhook] Paiement confirmé — session: ${sessionId}`);
        }
    }

    // Paiement échoué / annulé
    if (event.type === "checkout.session.failed" || event.type === "checkout.session.cancelled") {
        const sessionId = event.data?.id as string | undefined;
        if (sessionId) {
            await prisma.reglement.updateMany({
                where: { reference: sessionId, statut: "EN_ATTENTE" },
                data:  { statut: StatutPaiement.ANNULE },
            });
            console.log(`[Wave Webhook] Paiement ${event.type} — session: ${sessionId}`);
        }
    }

    return NextResponse.json({ received: true });
}
