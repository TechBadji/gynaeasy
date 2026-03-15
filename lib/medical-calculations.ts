import { differenceInDays, addDays, format, isBefore, isAfter } from "date-fns";

/**
 * Calcule le nombre de Semaines d'Aménorrhée (SA) et de jours depuis la DDR.
 * Formule : (Date du jour - DDR) en jours / 7
 */
export function calculerSA(ddr: Date | null, currentDate: Date = new Date()): { sa: number; jours: number; totalJours: number } {
    if (!ddr) return { sa: 0, jours: 0, totalJours: 0 };

    const joursDiff = differenceInDays(currentDate, ddr);

    if (joursDiff < 0) return { sa: 0, jours: 0, totalJours: 0 };

    return {
        sa: Math.floor(joursDiff / 7),
        jours: joursDiff % 7,
        totalJours: joursDiff,
    };
}

/**
 * Calcule la Date Prévue d'Accouchement (DPA).
 * Classiquement en France : DDR + 14 jours (date de conception) + 9 mois.
 * En simplifiant : on ajoute 280 jours (40 SA) ou 284 jours (41 SA en France) à la DDR.
 * La norme française retient souvent 41 SA.
 */
export function calculerDPA(ddr: Date): Date {
    return addDays(ddr, 284); // 41 SA de grossesse
}

export type ExamenObligatoire = {
    nom: string;
    saMin: number;
    saMax: number;
    description: string;
};

/**
 * Liste des examens clés d'une grossesse basés sur les SA.
 */
export const EXAMENS_GROSSESSE: ExamenObligatoire[] = [
    { nom: "Échographie T1", saMin: 11, saMax: 13, description: "Datation et mesure de la clarté nucale." },
    { nom: "Entretien Prénatal Précoce", saMin: 14, saMax: 16, description: "Obligatoire, discussion sur le projet de naissance." },
    { nom: "Échographie T2", saMin: 21, saMax: 24, description: "Échographie morphologique." },
    { nom: "Test HGPO (selon risques)", saMin: 24, saMax: 28, description: "Dépistage du diabète gestationnel." },
    { nom: "Échographie T3", saMin: 31, saMax: 34, description: "Évaluation de la croissance et position du fœtus." },
    { nom: "Consultation Anesthésie", saMin: 36, saMax: 38, description: "Consultation obligatoire à la maternité." },
];

/**
 * Identifie le prochain examen imminent ou en retard.
 */
export function getProchainExamen(ddr: Date | null): { examen: ExamenObligatoire; status: "A_VENIR" | "A_FAIRE_MAINTENANT" | "EN_RETARD" } | null {
    if (!ddr) return null;
    const { sa } = calculerSA(ddr);

    for (const examen of EXAMENS_GROSSESSE) {
        if (sa < examen.saMin) return { examen, status: "A_VENIR" };
        if (sa >= examen.saMin && sa <= examen.saMax) return { examen, status: "A_FAIRE_MAINTENANT" };
    }

    return null; // Tous les examens standards sont passés
}
