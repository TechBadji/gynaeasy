/**
 * Service d'envoi de messages WhatsApp
 * Supporte le mode Simulation ou l'API Meta/Twilio
 */
export async function sendWhatsApp(to: string, message: string) {
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Mode Simulation par défaut si pas de clés
    if (!apiToken || !phoneNumberId) {
        console.log(`[SIMULATION WHATSAPP] Vers: ${to} | Message: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { 
            success: true, 
            messageId: `wa_${Math.random().toString(36).substring(2, 9)}`, 
            simulated: true 
        };
    }

    try {
        // Nettoyage du numéro
        const cleanTo = to.replace(/^\+|^00/, '');
        const finalTo = cleanTo.startsWith('221') ? cleanTo : `221${cleanTo}`;

        const response = await fetch(
            `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: finalTo,
                    type: "text",
                    text: { body: message },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Erreur WhatsApp API");
        }

        const data = await response.json();
        return { 
            success: true, 
            messageId: data.messages?.[0]?.id, 
            simulated: false 
        };
    } catch (error: any) {
        console.error("WhatsApp Send Error:", error);
        return { success: false, error: error.message };
    }
}
