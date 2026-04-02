/**
 * Normalise un numéro de téléphone sénégalais en format E.164 sans préfixe.
 * Gère : +221XXXXXXXXX, 00221XXXXXXXXX, 221XXXXXXXXX, 77XXXXXXX, 0XXXXXXXXX
 * Retourne : "221XXXXXXXXX"
 */
function normalizePhoneNumber(phone: string): string {
    // Supprimer espaces, tirets, parenthèses
    let cleaned = phone.replace(/[\s\-().]/g, '');

    // Supprimer le + ou 00 au début
    cleaned = cleaned.replace(/^\+/, '').replace(/^00/, '');

    // Format local avec 0 initial (ex: 0771234567 → 771234567)
    if (!cleaned.startsWith('221') && cleaned.startsWith('0')) {
        cleaned = cleaned.slice(1);
    }

    // Ajouter le code pays Sénégal si absent
    if (!cleaned.startsWith('221')) {
        cleaned = `221${cleaned}`;
    }

    return cleaned; // "221XXXXXXXXX"
}

/**
 * Service d'envoi de SMS via Orange Sénégal API
 * Supporte le mode Simulation si les clés ne sont pas configurées
 */
export async function sendSMS(to: string, message: string) {
    const clientId = process.env.ORANGE_SMS_CLIENT_ID;
    const clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET;
    const senderNumber = process.env.ORANGE_SMS_SENDER_NUMBER; // Format: +221XXXXXXXXX
    const senderName = process.env.ORANGE_SMS_SENDER_NAME; // Optionnel
    
    // Mode Simulation par défaut si pas de clés
    if (!clientId || !clientSecret || !senderNumber) {
        console.warn("[SMS] Clés Orange manquantes — MODE SIMULATION. Configurez ORANGE_SMS_CLIENT_ID, ORANGE_SMS_CLIENT_SECRET, ORANGE_SMS_SENDER_NUMBER sur Vercel.");
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            success: true as const,
            messageId: `sim_${Math.random().toString(36).substring(2, 9)}`,
            simulated: true as const
        };
    }

    try {
        console.log(`🚀 Tentative d'envoi SMS Réel (Orange SN) vers ${to}...`);

        // 1. Obtenir le token d'accès
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenResponse = await fetch("https://api.orange.com/oauth/v3/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });

        if (!tokenResponse.ok) {
            const errBody = await tokenResponse.text();
            console.error("❌ Erreur Auth Orange SMS:", { status: tokenResponse.status, body: errBody });
            throw new Error(`Échec Authentification Orange (${tokenResponse.status})`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Préparer les numéros (Norme E.164 tel:+221...)
        const cleanTo = normalizePhoneNumber(to);
        const cleanFrom = normalizePhoneNumber(senderNumber);

        const rawSender = senderNumber.replace(/[\s\-().+]/g, '').replace(/^00/, '');
        const isShortCode = rawSender.length < 8;

        const formattedTo = `tel:+${cleanTo}`;
        // Short code : tel:326742 (pas de +, pas de code pays)
        // Numéro long : tel:+221XXXXXXXXX
        const formattedFrom = isShortCode ? `tel:${rawSender}` : `tel:+${cleanFrom}`;

        // URL Orange Message : l'expéditeur doit être encodé
        const requestUrl = `https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(formattedFrom)}/requests`;

        const body: any = {
            outboundSMSMessageRequest: {
                address: formattedTo, // Doit être une string, pas un tableau (Orange OneAPI SN)
                senderAddress: formattedFrom,
                outboundSMSTextMessage: { message }
            }
        };

        // senderName uniquement si validé par Orange SN (sinon retirer la variable env)
        if (senderName) {
            body.outboundSMSMessageRequest.senderName = senderName;
        }

        // [DEBUG] Log exact request for diagnosis
        console.log("[SMS DEBUG] URL:", requestUrl);
        console.log("[SMS DEBUG] Body:", JSON.stringify(body, null, 2));

        const smsResponse = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const rawResponseText = await smsResponse.text();
        console.log("[SMS DEBUG] HTTP Status:", smsResponse.status);
        console.log("[SMS DEBUG] Full Response:", rawResponseText);

        if (!smsResponse.ok) {
            let errorMessage = "Erreur API Orange";
            try {
                const errorJson = JSON.parse(rawResponseText);
                errorMessage = errorJson.requestError?.serviceException?.variables?.[0]
                            || errorJson.requestError?.policyException?.variables?.[0]
                            || `Erreur ${smsResponse.status}`;
            } catch {
                errorMessage = `Erreur HTTP ${smsResponse.status}`;
            }
            console.error("❌ Échec envoi SMS Orange:", rawResponseText);
            throw new Error(errorMessage);
        }

        const smsData = JSON.parse(rawResponseText);
        const resourceUrl = smsData.outboundSMSMessageRequest?.resourceReference?.resourceURL || "";
        const messageId = resourceUrl.split('/').pop() || "sent";

        console.log(`✅ SMS envoyé avec succès ! ID: ${messageId}`);

        return {
            success: true as const,
            messageId,
            simulated: false as const
        };
    } catch (error: any) {
        console.error("🚨 Erreur Service SMS:", error.message);
        return { success: false, error: error.message, messageId: null, simulated: false };
    }
}
