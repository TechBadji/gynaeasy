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
        console.warn("⚠️ SMS ORANGE : Clés manquantes. Passage en MODE SIMULATION.");
        console.log(`[SIMULATION SMS] Vers: ${to} | Message: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { 
            success: true, 
            messageId: `sim_${Math.random().toString(36).substring(2, 9)}`, 
            simulated: true 
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
        const cleanTo = to.replace(/^\+|^00/, '');
        const cleanFrom = senderNumber.replace(/^\+|^00/, '');
        
        const finalTo = `+${cleanTo.startsWith('221') ? cleanTo : `221${cleanTo}`}`;
        const isShortCode = cleanFrom.length < 8;
        const finalFrom = isShortCode ? cleanFrom : `+${cleanFrom.startsWith('221') ? cleanFrom : `221${cleanFrom}`}`;

        const formattedTo = `tel:+${cleanTo.startsWith('221') ? cleanTo : `221${cleanTo}`}`;
        const formattedFrom = isShortCode ? `tel:${cleanFrom}` : `tel:+${cleanFrom.startsWith('221') ? cleanFrom : `221${cleanFrom}`}`;
        
        // Pour l'URL, certaines doc Orange indiquent de ne pas mettre le +
        const urlFrom = isShortCode ? cleanFrom : (cleanFrom.startsWith('221') ? cleanFrom : `221${cleanFrom}`);
        const formattedUrlFrom = `tel:${urlFrom}`;

        // URL Orange Message : l'expéditeur doit être encodé (tel%3A221...)
        const requestUrl = `https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(formattedUrlFrom)}/requests`;

        const body: any = {
            outboundSMSMessageRequest: {
                address: formattedTo,
                senderAddress: formattedFrom,
                outboundSMSTextMessage: { message }
            }
        };

        // Si un nom d'expéditeur est configuré et validé par Orange
        if (senderName) {
            body.outboundSMSMessageRequest.senderName = senderName;
        }

        const smsResponse = await fetch(requestUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!smsResponse.ok) {
            const errorBody = await smsResponse.text();
            let errorMessage = "Erreur API Orange";
            try {
                const errorJson = JSON.parse(errorBody);
                errorMessage = errorJson.requestError?.serviceException?.variables?.[0] 
                            || errorJson.requestError?.policyException?.variables?.[0]
                            || `Erreur ${smsResponse.status}`;
            } catch {
                errorMessage = `Erreur HTTP ${smsResponse.status}`;
            }
            console.error("❌ Échec envoi SMS Orange:", errorBody);
            throw new Error(errorMessage);
        }

        const smsData = await smsResponse.json();
        const resourceUrl = smsData.outboundSMSMessageRequest?.resourceReference?.resourceURL || "";
        const messageId = resourceUrl.split('/').pop() || "sent";

        console.log(`✅ SMS envoyé avec succès ! ID: ${messageId}`);

        return { 
            success: true, 
            messageId, 
            simulated: false 
        };
    } catch (error: any) {
        console.error("🚨 Erreur Service SMS:", error.message);
        return { success: false, error: error.message, messageId: null, simulated: false };
    }
}
