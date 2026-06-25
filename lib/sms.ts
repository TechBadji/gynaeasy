/**
 * Normalise un numéro sénégalais → "221XXXXXXXXX" (sans + ni 00)
 * Gère : +221..., 00221..., 221..., 77XXXXXXX, 0XXXXXXXXX
 */
function normalizePhoneNumber(phone: string): string {
    let n = phone.replace(/[\s\-().]/g, "").replace(/^\+/, "").replace(/^00/, "");
    if (!n.startsWith("221") && n.startsWith("0")) n = n.slice(1);
    if (!n.startsWith("221")) n = `221${n}`;
    return n; // "221XXXXXXXXX"
}

const LAM_API_URL = "https://lamsms.lafricamobile.com/api";

/**
 * Envoi SMS via LaFricaMobile LAMPUSH
 * Docs : https://developers.lafricamobile.com/docs/sms/introduction
 *
 * Variables d'environnement requises :
 *   LAM_ACCESS_KEY      — accountid LAM (ex: DIGITALMATIS.COM_01)
 *   LAM_ACCESS_PASSWORD — password LAM
 *
 * Optionnel :
 *   LAM_SENDER_ID       — nom expéditeur affiché (défaut : Gynaeasy)
 */
export async function sendSMS(to: string, message: string) {
    const accountId = process.env.LAM_ACCESS_KEY;
    const password  = process.env.LAM_ACCESS_PASSWORD;
    const sender    = process.env.LAM_SENDER_ID || "Gynaeasy";

    // ── Mode simulation ──────────────────────────────────────────────────────
    if (!accountId || !password) {
        const missing = [!accountId && "LAM_ACCESS_KEY", !password && "LAM_ACCESS_PASSWORD"]
            .filter(Boolean).join(", ");
        console.log(`[SMS SIMULATION] → ${to} | ${message.slice(0, 60)}… (manquant : ${missing})`);
        return {
            success:   true  as const,
            messageId: `sim_${Math.random().toString(36).slice(2, 9)}`,
            simulated: true  as const,
            debug: { mode: "SIMULATION", reason: `Variables manquantes : ${missing}` },
        };
    }

    // ── Envoi réel LaFricaMobile LAMPUSH ────────────────────────────────────
    try {
        const gsm   = normalizePhoneNumber(to); // "221XXXXXXXXX"
        const retId = `gynaeasy_${Date.now()}`;

        const payload = {
            accountid: accountId,
            password,
            sender,
            ret_id:   retId,
            priority: "2",
            text:     message,
            to: [{ [retId]: gsm }],
        };

        const rawText = await fetch(LAM_API_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body:    JSON.stringify(payload),
        }).then(r => r.text());

        let data: any = null;
        try { data = JSON.parse(rawText); } catch { /* réponse texte brut */ }

        // Succès : LAM retourne success true, status "success", code 200,
        // ou directement un objet avec message_id
        const ok =
            data?.success === true  ||
            data?.status  === "success" ||
            data?.code    === 200   ||
            data?.code    === "200" ||
            (data && "message_id" in data);

        if (ok) {
            const messageId = data?.message_id ?? data?.msg_id ?? data?.id ?? retId;
            console.log(`[SMS LAM] Envoyé à ${to} — id: ${messageId}`);
            return {
                success:   true as const,
                messageId: String(messageId),
                simulated: false as const,
                debug: { body: rawText },
            };
        }

        const errorMsg =
            data?.message ?? data?.error ?? data?.msg ??
            (rawText.length < 200 ? rawText : "Erreur LAM inconnue");

        console.error(`[SMS LAM] Échec vers ${to} :`, rawText);
        return {
            success:   false as const,
            error:     errorMsg,
            messageId: null,
            simulated: false as const,
            debug: { body: rawText },
        };
    } catch (error: any) {
        console.error("[SMS LAM] Erreur réseau :", error.message);
        return {
            success:   false as const,
            error:     error.message,
            messageId: null,
            simulated: false as const,
        };
    }
}
