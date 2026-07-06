import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const RDV_TYPES = ["CONSULTATION", "ECHOGRAPHIE", "SUIVI_GROSSESSE", "URGENCE", "TELECONSULTATION"];

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: "GROQ_API_KEY non configurée" }, { status: 503 });
    }

    let body: { text: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
    }

    if (!body.text?.trim()) {
        return NextResponse.json({ error: "Texte vide" }, { status: 400 });
    }

    const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
    const todayIso = new Date().toISOString().split("T")[0];

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 400,
        temperature: 0,
        messages: [
            {
                role: "system",
                content: `Tu es un assistant qui extrait des informations de rendez-vous médical depuis un texte en français.
Aujourd'hui : ${today} (${todayIso}).

Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas d'explication).
Format :
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "type": "CONSULTATION|ECHOGRAPHIE|SUIVI_GROSSESSE|URGENCE|TELECONSULTATION",
  "duration": 30,
  "patientName": "Prénom Nom ou null",
  "motif": "motif court ou null"
}

Règles :
- "demain" = ${format(new Date(Date.now() + 86400000), "yyyy-MM-dd")}
- Si aucune heure mentionnée : null
- Si aucun patient mentionné : null pour patientName
- type par défaut : CONSULTATION
- duration : 15, 30, 45, 60, ou 90 (défaut 30)
- Mots-clés → type : "écho/échographie"→ECHOGRAPHIE, "grossesse/suivi"→SUIVI_GROSSESSE, "urgence"→URGENCE, "télé/video"→TELECONSULTATION`,
            },
            {
                role: "user",
                content: body.text,
            },
        ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";

    let parsed: any;
    try {
        // Extraire le JSON si entouré de texte
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match ? match[0] : raw);
    } catch {
        return NextResponse.json({ error: "L'IA n'a pas pu extraire les informations" }, { status: 422 });
    }

    // Validation / nettoyage
    const result = {
        date:        typeof parsed.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
        time:        typeof parsed.time === "string" && /^\d{2}:\d{2}$/.test(parsed.time) ? parsed.time : null,
        type:        RDV_TYPES.includes(parsed.type) ? parsed.type : "CONSULTATION",
        duration:    [15, 30, 45, 60, 90].includes(Number(parsed.duration)) ? Number(parsed.duration) : 30,
        patientName: typeof parsed.patientName === "string" ? parsed.patientName.trim() : null,
        motif:       typeof parsed.motif === "string" ? parsed.motif.trim() : null,
    };

    return NextResponse.json(result);
}
