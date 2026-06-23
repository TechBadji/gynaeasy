/**
 * Normalise un numéro sénégalais en format E.164 : +221XXXXXXXXX
 * Gère : +221..., 00221..., 221..., 77XXXXXXX, 0XXXXXXXXX
 */
function normalizePhoneNumber(phone: string): string {
    let n = phone.replace(/[\s\-().]/g, "").replace(/^\+/, "").replace(/^00/, "");
    if (!n.startsWith("221") && n.startsWith("0")) n = n.slice(1);
    if (!n.startsWith("221")) n = `221${n}`;
    return `+${n}`; // Africa's Talking exige le "+" en E.164
}

/**
 * Envoie un SMS via Africa's Talking (Sénégal — tous opérateurs)
 * Passe automatiquement en mode simulation si les clés ne sont pas configurées.
 */
export async function sendSMS(to: string, message: string) {
    const apiKey   = process.env.AT_API_KEY;
    const username = process.env.AT_USERNAME;
    const senderId = process.env.AT_SENDER_ID; // Optionnel — doit être validé par AT

    // ── Mode simulation ──────────────────────────────────────────────────────
    if (!apiKey || !username) {
        const missing = [!apiKey && "AT_API_KEY", !username && "AT_USERNAME"]
            .filter(Boolean).join(", ");
        console.log(`[SMS SIMULATION] → ${to} : "${message.slice(0, 60)}…" (${missing})`);
        return {
            success: true  as const,
            messageId: `sim_${Math.random().toString(36).slice(2, 9)}`,
            simulated: true as const,
            debug: { mode: "SIMULATION", reason: `Variables manquantes : ${missing}` },
        };
    }

    // ── Envoi réel Africa's Talking ──────────────────────────────────────────
    try {
        const normalizedTo = normalizePhoneNumber(to);

        const params = new URLSearchParams({ username, to: normalizedTo, message });
        if (senderId) params.set("from", senderId);

        const response = await fetch("https://api.africastalking.com/version1/messaging", {
            method: "POST",
            headers: {
                apiKey,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: params.toString(),
        });

        // AT renvoie du texte brut en cas d'erreur d'auth (ex: "The supplied apiKey is invalid")
        const rawText = await response.text();
        let data: any = null;
        try { data = JSON.parse(rawText); } catch { /* pas du JSON */ }

        if (!response.ok) {
            const errMsg = data?.SMSMessageData?.Message
                ?? (rawText.length < 200 ? rawText : `Erreur HTTP ${response.status}`);
            console.error(`[SMS] Africa's Talking HTTP ${response.status}:`, rawText);
            return {
                success: false as const,
                error: errMsg,
                messageId: null,
                simulated: false as const,
                debug: { status: response.status, body: rawText },
            };
        }

        // Réponse OK mais pas du JSON (ne devrait pas arriver)
        if (!data) {
            return {
                success: false as const,
                error: `Réponse inattendue : ${rawText.slice(0, 100)}`,
                messageId: null,
                simulated: false as const,
                debug: { status: response.status, body: rawText },
            };
        }

        const recipient = data?.SMSMessageData?.Recipients?.[0];

        // Codes succès : 100 Processed, 101 Sent, 102 Queued
        if (recipient && [100, 101, 102].includes(recipient.statusCode)) {
            return {
                success: true  as const,
                messageId: recipient.messageId as string,
                simulated: false as const,
                debug: { status: response.status, body: data },
            };
        }

        // Codes d'erreur AT documentés
        const AT_ERRORS: Record<number, string> = {
            401: "Message bloqué (RiskHold)",
            402: "Sender ID non validé",
            403: "Numéro invalide",
            404: "Type de numéro non supporté",
            405: "Solde insuffisant — rechargez le compte Africa's Talking",
            406: "Compte en mode sandbox — numéro non enregistré comme test",
            407: "Routage impossible vers cet opérateur",
            500: "Erreur interne Africa's Talking",
            501: "Erreur passerelle opérateur",
            502: "Message rejeté par la passerelle",
        };

        const errorMsg = recipient
            ? (AT_ERRORS[recipient.statusCode] ?? `Erreur AT code ${recipient.statusCode}`)
            : "Réponse inattendue de l'API Africa's Talking";

        return {
            success: false as const,
            error: errorMsg,
            messageId: null,
            simulated: false as const,
            debug: { status: response.status, body: data, recipient },
        };
    } catch (error: any) {
        console.error("[SMS] Erreur Africa's Talking :", error.message);
        return {
            success: false as const,
            error: error.message,
            messageId: null,
            simulated: false as const,
        };
    }
}
