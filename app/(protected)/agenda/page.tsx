import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfWeek, endOfWeek } from "date-fns";
import AgendaClient from "./agenda-client";

export default async function AgendaPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const weekStart  = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd    = endOfWeek(now,   { weekStartsOn: 1 });

    const [consultations, patients, countToday, countWeek, prochainRDV] = await Promise.all([
        prisma.consultation.findMany({
            where: { userId },
            include: {
                patient: { select: { civilite: true, nom: true, prenom: true, id: true } },
            },
            orderBy: { dateHeure: "asc" },
        }),
        prisma.patient.findMany({
            where: { treatingDoctorId: userId },
            select: { id: true, nom: true, prenom: true, civilite: true, telephone: true },
            orderBy: { nom: "asc" },
        }),
        prisma.consultation.count({
            where: { userId, dateHeure: { gte: todayStart, lte: todayEnd } },
        }),
        prisma.consultation.count({
            where: { userId, dateHeure: { gte: weekStart, lte: weekEnd } },
        }),
        prisma.consultation.findFirst({
            where: { userId, dateHeure: { gt: now } },
            select: { dateHeure: true },
            orderBy: { dateHeure: "asc" },
        }),
    ]);

    const serializedEvents = consultations.map((c: any) => ({
        id:              c.id,
        title:           `${c.patient.civilite} ${c.patient.nom.toUpperCase()} ${c.patient.prenom}${c.motif ? ` — ${c.motif}` : ""}`,
        start:           c.dateHeure.toISOString(),
        end:             new Date(c.dateHeure.getTime() + c.duree * 60000).toISOString(),
        type:            c.type as string,
        source:          c.source as string,
        motif:           c.motif ?? null,
        duree:           c.duree as number,
        patientId:       c.patient.id as string,
        patientNom:      c.patient.nom as string,
        patientPrenom:   c.patient.prenom as string,
        patientCivilite: c.patient.civilite as string,
    }));

    return (
        <AgendaClient
            initialEvents={serializedEvents}
            patients={patients}
            stats={{
                today:   countToday,
                week:    countWeek,
                nextRdv: prochainRDV?.dateHeure.toISOString() ?? null,
            }}
        />
    );
}
