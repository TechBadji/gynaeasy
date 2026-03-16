"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StatutPaiement, ModePaiement } from "@prisma/client";

/**
 * Récupère tous les actes CCAM actifs
 */
export async function getActiveCCAMCodes() {
    return await prisma.acteCCAM.findMany({
        where: { active: true },
        orderBy: { code: "asc" }
    });
}

/**
 * Crée un règlement pour une consultation
 */
export async function createReglement(data: {
    consultationId: string;
    montant: number;
    mode: ModePaiement;
    reference?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error("Non authentifié");

    const reglement = await prisma.reglement.create({
        data: {
            consultationId: data.consultationId,
            montant: data.montant,
            mode: data.mode,
            reference: data.reference,
            statut: StatutPaiement.PAYE,
            dateReglement: new Date(),
        },
        include: {
            consultation: {
                include: {
                    patient: {
                        select: { nom: true, prenom: true, codePatient: true }
                    },
                    user: {
                        select: { name: true }
                    }
                }
            }
        }
    });

    // Mettre à jour l'honoraire de la consultation si nécessaire
    await prisma.consultation.update({
        where: { id: data.consultationId },
        data: { honoraire: data.montant }
    });

    revalidatePath("/facturation");
    revalidatePath("/dashboard");

    return { success: true, reglement };
}

/**
 * Récupère les factures récentes (règlements)
 */
export async function getRecentInvoices() {
    return await prisma.reglement.findMany({
        include: {
            consultation: {
                include: {
                    patient: {
                        select: { nom: true, prenom: true, codePatient: true }
                    },
                    user: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 50
    });
}
