function normalizeWA(phone: string): string {
    let n = phone.replace(/[\s\-().+]/g, "").replace(/^00/, "");
    if (n.startsWith("0") && !n.startsWith("00")) n = n.slice(1);
    if (!n.startsWith("221")) n = `221${n}`;
    return n;
}

/**
 * Envoie un message WhatsApp via Meta Cloud API (v25.0).
 * Mode simulation si les variables d'environnement sont absentes.
 *
 * Note Meta : pour contacter un numéro qui ne vous a pas écrit en premier,
 * utilisez sendWhatsAppTemplate(). sendWhatsApp() fonctionne dans la fenêtre
 * de 24h après un message entrant du patient.
 */
export async function sendWhatsApp(to: string, message: string) {
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiToken || !phoneNumberId) {
        console.log(`[SIMULATION WHATSAPP] → ${to} | ${message}`);
        return {
            success: true as const,
            messageId: `wa_sim_${Math.random().toString(36).slice(2, 9)}`,
            simulated: true as const,
        };
    }

    try {
        const finalTo = normalizeWA(to);

        const response = await fetch(
            `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
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

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data?.error?.message || `Erreur HTTP ${response.status}`;
            console.error("[WhatsApp API]", errMsg);
            return { success: false as const, error: errMsg, simulated: false as const };
        }

        return {
            success: true as const,
            messageId: data.messages?.[0]?.id ?? "sent",
            simulated: false as const,
        };
    } catch (error: any) {
        console.error("[WhatsApp Send Error]", error.message);
        return { success: false as const, error: error.message, simulated: false as const };
    }
}

/**
 * Envoie un template WhatsApp approuvé.
 * Obligatoire pour les messages sortants (broadcasts) vers des numéros
 * qui n'ont pas initié de conversation dans les 24h.
 *
 * Exemple : template "hello_world" en langue "en_US" (fourni par Meta par défaut).
 * Créez vos propres templates dans Meta Business Manager → Message Templates.
 */
export async function sendWhatsAppTemplate(
    to: string,
    templateName: string,
    languageCode: string = "fr",
    components?: object[],
) {
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiToken || !phoneNumberId) {
        console.log(`[SIMULATION WA TEMPLATE] → ${to} | ${templateName}`);
        return {
            success: true as const,
            messageId: `wa_tpl_sim_${Math.random().toString(36).slice(2, 9)}`,
            simulated: true as const,
        };
    }

    try {
        const finalTo = normalizeWA(to);

        const body: any = {
            messaging_product: "whatsapp",
            to: finalTo,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                ...(components ? { components } : {}),
            },
        };

        const response = await fetch(
            `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const errMsg = data?.error?.message || `Erreur HTTP ${response.status}`;
            console.error("[WhatsApp Template API]", errMsg);
            return { success: false as const, error: errMsg, simulated: false as const };
        }

        return {
            success: true as const,
            messageId: data.messages?.[0]?.id ?? "sent",
            simulated: false as const,
        };
    } catch (error: any) {
        console.error("[WhatsApp Template Error]", error.message);
        return { success: false as const, error: error.message, simulated: false as const };
    }
}
