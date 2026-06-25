"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format, subMonths, startOfMonth, endOfMonth, differenceInYears } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
    CONSULTATION:    "Consultation gynéco",
    ECHOGRAPHIE:     "Échographie",
    URGENCE:         "Urgence",
    SUIVI_GROSSESSE: "Suivi grossesse",
    TELECONSULTATION:"Téléconsultation",
};

export async function getStatisticsData() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const userId = (session.user as any).id;
    const now    = new Date();

    const startCurMonth  = startOfMonth(now);
    const startLastMonth = startOfMonth(subMonths(now, 1));
    const endLastMonth   = endOfMonth(subMonths(now, 1));
    const start6Months   = startOfMonth(subMonths(now, 5));

    const [
        totalPatients,
        newThisMonth,
        newLastMonth,
        consultThisMonth,
        consultLastMonth,
        grossessesEnCours,
        consultations6M,
        patients6M,
        allPatients,
        reglements6M,
        smsRemindedCount,
        consultWithPhoneCount,
    ] = await Promise.all([
        prisma.patient.count({ where: { treatingDoctorId: userId } }),
        prisma.patient.count({ where: { treatingDoctorId: userId, createdAt: { gte: startCurMonth } } }),
        prisma.patient.count({ where: { treatingDoctorId: userId, createdAt: { gte: startLastMonth, lte: endLastMonth } } }),
        prisma.consultation.count({ where: { userId, dateHeure: { gte: startCurMonth } } }),
        prisma.consultation.count({ where: { userId, dateHeure: { gte: startLastMonth, lte: endLastMonth } } }),
        prisma.grossesse.count({ where: { patient: { treatingDoctorId: userId }, statut: "EN_COURS" } }),
        prisma.consultation.findMany({
            where: { userId, dateHeure: { gte: start6Months } },
            select: { dateHeure: true, type: true, honoraire: true },
        }),
        prisma.patient.findMany({
            where: { treatingDoctorId: userId, createdAt: { gte: start6Months } },
            select: { createdAt: true },
        }),
        prisma.patient.findMany({
            where: { treatingDoctorId: userId },
            select: { dateNaissance: true },
        }),
        prisma.reglement.findMany({
            where: { statut: "PAYE", consultation: { userId }, dateReglement: { gte: start6Months } },
            select: { montant: true, dateReglement: true, mode: true },
        }),
        prisma.consultation.count({ where: { userId, dateHeure: { gte: startCurMonth }, smsReminded: true } }),
        prisma.consultation.count({ where: { userId, dateHeure: { gte: startCurMonth }, patient: { telephone: { not: null, notIn: [""] } } } }),
    ]);

    // ── Données mensuelles (6 mois) ──────────────────────────────────────────
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i);
        return {
            key:              format(d, "yyyy-MM"),
            label:            format(d, "MMM", { locale: fr }),
            consultations:    0,
            nouveauxPatients: 0,
            ca:               0,
        };
    });

    consultations6M.forEach(c => {
        const m = months.find(x => x.key === format(new Date(c.dateHeure), "yyyy-MM"));
        if (m) m.consultations++;
    });
    patients6M.forEach(p => {
        const m = months.find(x => x.key === format(new Date(p.createdAt), "yyyy-MM"));
        if (m) m.nouveauxPatients++;
    });
    reglements6M.forEach(r => {
        if (!r.dateReglement) return;
        const m = months.find(x => x.key === format(new Date(r.dateReglement!), "yyyy-MM"));
        if (m) m.ca += r.montant;
    });

    // ── Répartition types de RDV ─────────────────────────────────────────────
    const typeCount: Record<string, number> = {};
    consultations6M.forEach(c => { typeCount[c.type] = (typeCount[c.type] || 0) + 1; });
    const repartitionTypes = Object.entries(typeCount)
        .map(([type, value]) => ({ name: TYPE_LABELS[type] || type, value }))
        .sort((a, b) => b.value - a.value);

    // ── Tranches d'âge ───────────────────────────────────────────────────────
    const ageBuckets: Record<string, number> = { "<20": 0, "20–30": 0, "30–40": 0, "40–50": 0, "50+": 0 };
    allPatients.forEach(p => {
        const age = differenceInYears(now, new Date(p.dateNaissance));
        if      (age < 20) ageBuckets["<20"]++;
        else if (age < 30) ageBuckets["20–30"]++;
        else if (age < 40) ageBuckets["30–40"]++;
        else if (age < 50) ageBuckets["40–50"]++;
        else               ageBuckets["50+"]++;
    });
    const ageData = Object.entries(ageBuckets).map(([label, count]) => ({ label, count }));

    // ── Modes de paiement ────────────────────────────────────────────────────
    const modeCount: Record<string, number> = {};
    reglements6M.forEach(r => { modeCount[r.mode] = (modeCount[r.mode] || 0) + 1; });
    const modePaiement = Object.entries(modeCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // ── CA ce mois ───────────────────────────────────────────────────────────
    const caThisMonth = reglements6M
        .filter(r => r.dateReglement && new Date(r.dateReglement) >= startCurMonth)
        .reduce((s, r) => s + r.montant, 0);

    const caLastMonth = reglements6M
        .filter(r => r.dateReglement &&
            new Date(r.dateReglement) >= startLastMonth &&
            new Date(r.dateReglement) <= endLastMonth)
        .reduce((s, r) => s + r.montant, 0);

    const evo = (cur: number, prev: number) =>
        prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;

    return {
        kpis: {
            totalPatients,
            newPatientsThisMonth:    newThisMonth,
            newPatientsEvolution:    evo(newThisMonth, newLastMonth),
            consultationsThisMonth:  consultThisMonth,
            consultationsEvolution:  evo(consultThisMonth, consultLastMonth),
            grossessesEnCours,
            caThisMonth,
            caEvolution:             evo(caThisMonth, caLastMonth),
            smsRemindedCount,
            consultWithPhoneCount,
        },
        monthlyData:      months,
        repartitionTypes,
        ageData,
        modePaiement,
    };
}
