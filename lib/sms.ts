/**
 * Service d'envoi de SMS via Orange Sénégal API
 * Supporte le mode Simulation si les clés ne sont pas configurées
 */
export async function sendSMS(to: string, message: string) {
    const clientId = process.env.ORANGE_SMS_CLIENT_ID;
    const clientSecret = process.env.ORANGE_SMS_CLIENT_SECRET;
    const senderNumber = process.env.ORANGE_SMS_SENDER_NUMBER; // Format: +221XXXXXXXXX
    
    // Mode Simulation par défaut si pas de clés
    if (!clientId || !clientSecret || !senderNumber) {
        console.log(`[SIMULATION SMS ORANGE] Vers: ${to} | Message: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { 
            success: true, 
            messageId: `sim_${Math.random().toString(36).substring(2, 9)}`, 
            simulated: true 
        };
    }

    try {
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
            console.error("DEBUG ORANGE AUTH:", {
                status: tokenResponse.status,
                body: errBody,
                clientIdPrefix: clientId.substring(0, 5) + "..." 
            });
            throw new Error(`Orange Auth Failed (${tokenResponse.status}): ${errBody || tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Envoyer le SMS
        // Orange support: "avec votre code pays mais sans préfixe + ou 00" pour le SENDER
        const cleanTo = to.startsWith('+') ? to : `+221${to.replace(/^0+/, '')}`;
        const cleanFrom = senderNumber.replace(/^\+|^00/, ''); // Supprime le + ou 00
        
        const formattedTo = `tel:${cleanTo}`;
        const formattedFrom = `tel:${cleanFrom}`;

        const smsResponse = await fetch(`https://api.orange.com/smsmessaging/v1/outbound/${encodeURIComponent(formattedFrom)}/requests`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                outboundSMSMessageRequest: {
                    address: formattedTo,
                    senderAddress: formattedFrom,
                    outboundSMSTextMessage: {
                        message: message
                    }
                }
            })
        });

        if (!smsResponse.ok) {
            const errorData = await smsResponse.json();
            throw new Error(errorData.requestError?.serviceException?.variables?.[0] || "Erreur lors de l'envoi du SMS Orange");
        }

        const smsData = await smsResponse.json();
        const resourceUrl = smsData.outboundSMSMessageRequest?.resourceReference?.resourceURL || "";
        const messageId = resourceUrl.split('/').pop() || "sent";

        return { 
            success: true, 
            messageId, 
            simulated: false 
        };
    } catch (error: any) {
        console.error("Orange SMS Error:", error);
        return { success: false, error: error.message, messageId: null, simulated: false };
    }
}
