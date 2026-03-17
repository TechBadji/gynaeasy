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
        return { success: true, simulated: true };
    }

    try {
        // 1. Obtenir le token d'accès
        const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const tokenResponse = await fetch("https://api.orange.com/oauth/v2/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });

        if (!tokenResponse.ok) {
            throw new Error("Erreur lors de la récupération du token Orange");
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Envoyer le SMS
        // Format du numéro de téléphone Orange: tel:+221XXXXXXXXX
        const formattedTo = to.startsWith('+') ? `tel:${to}` : `tel:+221${to}`;
        const formattedFrom = `tel:${senderNumber}`;

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

        return { success: true };
    } catch (error: any) {
        console.error("Orange SMS Error:", error);
        return { success: false, error: error.message };
    }
}
