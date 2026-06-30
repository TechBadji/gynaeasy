const WAVE_API_URL = "https://api.wave.com/v1";

export type WaveCheckoutStatus = "pending" | "processing" | "complete" | "error";

export interface WaveCheckoutSession {
    id:               string;
    wave_launch_url:  string;
    checkout_status:  WaveCheckoutStatus;
    amount:           string;
    currency:         string;
    client_reference: string;
}

function isConfigured() {
    return !!process.env.WAVE_API_KEY;
}

export async function createWaveCheckout({
    amount,
    clientReference,
    successUrl,
    errorUrl,
}: {
    amount:           number;
    clientReference:  string;
    successUrl:       string;
    errorUrl:         string;
}): Promise<
    | { success: true;  session: WaveCheckoutSession; simulated: boolean }
    | { success: false; error: string }
> {
    if (!isConfigured()) {
        const fakeId = `wave_sim_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        console.log(`[Wave SIM] Checkout créé — ref: ${clientReference} montant: ${amount} XOF`);
        return {
            success: true,
            simulated: true,
            session: {
                id:               fakeId,
                wave_launch_url:  `https://pay.wave.com/m/simulation/${fakeId}`,
                checkout_status:  "pending",
                amount:           amount.toString(),
                currency:         "XOF",
                client_reference: clientReference,
            },
        };
    }

    try {
        const res = await fetch(`${WAVE_API_URL}/checkout/sessions`, {
            method: "POST",
            headers: {
                Authorization:  `Bearer ${process.env.WAVE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                currency:         "XOF",
                amount:           amount.toString(),
                success_url:      successUrl,
                error_url:        errorUrl,
                client_reference: clientReference,
            }),
        });

        const raw = await res.text();
        if (!res.ok) return { success: false, error: `Wave API ${res.status}: ${raw}` };

        const data = JSON.parse(raw) as WaveCheckoutSession;
        return { success: true, simulated: false, session: data };
    } catch (e: any) {
        return { success: false, error: e.message ?? "Erreur réseau Wave" };
    }
}

export async function getWaveCheckoutStatus(sessionId: string): Promise<{
    status:    WaveCheckoutStatus;
    simulated: boolean;
    error?:    string;
}> {
    if (!isConfigured()) {
        // En simulation, on ne peut pas confirmer automatiquement — l'admin confirme manuellement
        return { status: "pending", simulated: true };
    }

    try {
        const res = await fetch(`${WAVE_API_URL}/checkout/sessions/${sessionId}`, {
            headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` },
        });

        if (!res.ok) return { status: "error", simulated: false, error: await res.text() };

        const data = await res.json();
        return { status: data.checkout_status as WaveCheckoutStatus, simulated: false };
    } catch (e: any) {
        return { status: "error", simulated: false, error: e.message };
    }
}

export async function verifyWaveWebhookSignature(
    rawBody: string,
    signature: string,
): Promise<boolean> {
    const secret = process.env.WAVE_WEBHOOK_SECRET;
    if (!secret) return false;

    try {
        const enc  = new TextEncoder();
        const key  = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
        const sig  = Buffer.from(signature.replace("sha256=", ""), "hex");
        return await crypto.subtle.verify("HMAC", key, sig, enc.encode(rawBody));
    } catch {
        return false;
    }
}
