import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const userId = (session.user as any).id;

    let body: { consultationId: string; transcription: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const { consultationId, transcription } = body;
    if (!consultationId || !transcription?.trim()) {
        return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Vérification ownership + contexte patient
    const consultation = await prisma.consultation.findFirst({
        where: { id: consultationId, userId },
        include: {
            patient: {
                select: {
                    nom: true,
                    prenom: true,
                    civilite: true,
                    dateNaissance: true,
                    antecedentsMedicaux: true,
                    traitementsEnCours: true,
                    groupeSanguin: true,
                    rhesus: true,
                },
            },
        },
    });

    if (!consultation) {
        return NextResponse.json({ error: "Consultation introuvable" }, { status: 404 });
    }

    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: "GROQ_API_KEY non configurée" }, { status: 503 });
    }

    const patient = consultation.patient;
    const age = Math.floor(
        (Date.now() - new Date(patient.dateNaissance).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const antecedents = patient.antecedentsMedicaux
        ? JSON.stringify(patient.antecedentsMedicaux, null, 2)
        : "Non renseignés";

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const stream = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1800,
        stream: true,
        messages: [
            {
                role: "system",
                content: `Tu es un assistant médical spécialisé en gynécologie-obstétrique.
Tu aides le médecin à structurer ses observations, formuler des hypothèses diagnostiques et rédiger une ordonnance sur la base des symptômes qu'il décrit.

RÈGLES IMPORTANTES :
- Tes suggestions sont UNIQUEMENT indicatives et d'aide à la décision
- Le médecin reste seul responsable du diagnostic et de la prescription
- Adapte les médicaments au contexte sénégalais / africain (disponibilité locale)
- Rédige toujours en français, de façon concise et cliniquement précise
- Ne fais jamais de diagnostic affirmatif — utilise "à évoquer", "à confirmer par", etc.

Utilise EXACTEMENT ce format de réponse (ne modifie pas les titres de sections) :

## Hypothèses diagnostiques
[2 à 3 diagnostics différentiels les plus probables, avec justification clinique courte pour chacun]

## Examens complémentaires suggérés
[Liste des examens à réaliser pour confirmer ou écarter les hypothèses]

## Ordonnance suggérée
[Médicaments avec dosage, posologie et durée. Mention des contre-indications éventuelles si grossesse]

## Notes pour le dossier
[Résumé clinique structuré à intégrer dans le compte-rendu de consultation]`,
            },
            {
                role: "user",
                content: `Patiente : ${patient.civilite} ${patient.prenom} ${patient.nom}, ${age} ans
Groupe sanguin : ${patient.groupeSanguin ?? "NC"} ${patient.rhesus ?? ""}
Antécédents médicaux : ${antecedents}
Traitements en cours : ${patient.traitementsEnCours || "Aucun"}

Dictée du médecin (symptômes et signes cliniques) :
"${transcription}"`,
            },
        ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const text = chunk.choices[0]?.delta?.content ?? "";
                    if (text) controller.enqueue(encoder.encode(text));
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
