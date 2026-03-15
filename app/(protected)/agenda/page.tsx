import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AgendaClient from "./agenda-client";

export default async function AgendaPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    // Charger les consultations (on peut filtrer par médecin si besoin, mais pour le secrétaire on montre tout)
    const consultations = await prisma.consultation.findMany({
        include: {
            patient: {
                select: { civilite: true, nom: true, prenom: true }
            }
        },
        orderBy: { dateHeure: "asc" },
    });

    // Convertir les consultations en événements de calendrier
    const events = consultations.map((c: any) => ({
        id: c.id,
        title: `${c.patient.civilite} ${c.patient.nom.toUpperCase()} ${c.patient.prenom}${c.motif ? ` - ${c.motif}` : ""}`,
        start: c.dateHeure,
        end: new Date(c.dateHeure.getTime() + c.duree * 60000),
        type: c.type,
    }));

    // Charger la liste des patients pour le formulaire
    const patients = await prisma.patient.findMany({
        where: userId ? { userId } : {},
        select: { id: true, nom: true, prenom: true, civilite: true },
        orderBy: { nom: "asc" },
    });

    // Serialize dates to avoid Next.js serialization issues
    const serializedEvents = events.map((e: any) => ({
        ...e,
        type: e.type as string,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
    }));

    return <AgendaClient initialEvents={serializedEvents} patients={patients} />;
}
