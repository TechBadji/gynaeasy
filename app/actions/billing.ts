"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { StatutPaiement, ModePaiement } from "@prisma/client";
import { createWaveCheckout, getWaveCheckoutStatus } from "@/lib/wave";

const REGLE_INCLUDE = {
    consultation: {
        include: {
            patient: { select: { nom: true, prenom: true, codePatient: true, telephone: true } },
            user:    { select: { name: true } },
        },
    },
} as const;

async function getAuthorizedConsultation(consultationId: string, userId: string) {
    const c = await prisma.consultation.findUnique({
        where: { id: consultationId },
        select: { userId: true },
    });
    if (!c || c.userId !== userId) return null;
    return c;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTES CCAM
// ─────────────────────────────────────────────────────────────────────────────
export async function getActiveCCAMCodes() {
    return await prisma.acteCCAM.findMany({ where: { active: true }, orderBy: { code: "asc" } });
}

// ─────────────────────────────────────────────────────────────────────────────
// PAIEMENT MANUEL (Espèces, CB, Chèque, Virement, Mutuelle, Orange Money)
// ─────────────────────────────────────────────────────────────────────────────
export async function confirmManualPayment(data: {
    consultationId: string;
    montant:        number;
    mode:           ModePaiement;
    reference?:     string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Non authentifié" };
    const userId = (session.user as any).id;

    if (!await getAuthorizedConsultation(data.consultationId, userId))
        return { success: false, error: "Non autorisé" };

    // Supprimer un éventuel règlement EN_ATTENTE existant pour cette consultation
    await prisma.reglement.deleteMany({
        where: { consultationId: data.consultationId, statut: "EN_ATTENTE" },
    });

    const reglement = await prisma.reglement.create({
        data: {
            consultationId: data.consultationId,
            montant:        data.montant,
            mode:           data.mode,
            reference:      data.reference?.trim() || null,
            statut:         StatutPaiement.PAYE,
            dateReglement:  new Date(),
        },
        include: REGLE_INCLUDE,
    });

    await prisma.consultation.update({
        where: { id: data.consultationId },
        data:  { honoraire: data.montant },
    });

    revalidatePath("/facturation");
    revalidatePath("/dashboard");
    return { success: true, reglement: JSON.parse(JSON.stringify(reglement)) };
}

// Alias backward-compat
export const createReglement = confirmManualPayment;

// ─────────────────────────────────────────────────────────────────────────────
// WAVE — INITIER LE CHECKOUT
// ─────────────────────────────────────────────────────────────────────────────
export async function initiateWavePayment(data: {
    consultationId: string;
    montant:        number;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Non authentifié" };
    const userId = (session.user as any).id;

    if (!await getAuthorizedConsultation(data.consultationId, userId))
        return { success: false, error: "Non autorisé" };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gynaeasy.digitalmatis.com";

    const wave = await createWaveCheckout({
        amount:          data.montant,
        clientReference: data.consultationId,
        successUrl:      `${baseUrl}/facturation?wave_success=1&ref=${data.consultationId}`,
        errorUrl:        `${baseUrl}/facturation?wave_error=1&ref=${data.consultationId}`,
    });

    if (!wave.success) return { success: false, error: wave.error };

    // Supprimer tout règlement EN_ATTENTE existant pour cette consultation
    await prisma.reglement.deleteMany({
        where: { consultationId: data.consultationId, statut: "EN_ATTENTE" },
    });

    const reglement = await prisma.reglement.create({
        data: {
            consultationId: data.consultationId,
            montant:        data.montant,
            mode:           ModePaiement.WAVE,
            reference:      wave.session.id,
            statut:         StatutPaiement.EN_ATTENTE,
        },
        include: REGLE_INCLUDE,
    });

    await prisma.consultation.update({
        where: { id: data.consultationId },
        data:  { honoraire: data.montant },
    });

    return {
        success:      true,
        simulated:    wave.simulated,
        waveUrl:      wave.session.wave_launch_url,
        waveId:       wave.session.id,
        reglementId:  reglement.id,
        reglement:    JSON.parse(JSON.stringify(reglement)),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// WAVE — VÉRIFIER LE STATUT (polling côté client)
// ─────────────────────────────────────────────────────────────────────────────
export async function checkWavePaymentStatus(reglementId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, status: "error" as const };
    const userId = (session.user as any).id;

    const reglement = await prisma.reglement.findUnique({
        where: { id: reglementId },
        include: { consultation: { select: { userId: true } } },
    });
    if (!reglement || reglement.consultation.userId !== userId)
        return { success: false, status: "error" as const };

    if (reglement.statut === "PAYE") return { success: true, status: "complete" as const };

    if (!reglement.reference) return { success: false, status: "error" as const };

    const { status } = await getWaveCheckoutStatus(reglement.reference);

    if (status === "complete") {
        await prisma.reglement.update({
            where: { id: reglementId },
            data:  { statut: StatutPaiement.PAYE, dateReglement: new Date() },
        });
        revalidatePath("/facturation");
        revalidatePath("/dashboard");
    }

    return { success: true, status };
}

// ─────────────────────────────────────────────────────────────────────────────
// WAVE — CONFIRMER MANUELLEMENT (simulation ou cash wave)
// ─────────────────────────────────────────────────────────────────────────────
export async function confirmWavePaymentManual(reglementId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false };
    const userId = (session.user as any).id;

    const reglement = await prisma.reglement.findUnique({
        where: { id: reglementId },
        include: {
            consultation: {
                select: { userId: true },
                include: { patient: { select: { nom: true, prenom: true, codePatient: true } }, user: { select: { name: true } } },
            },
        },
    });
    if (!reglement || reglement.consultation.userId !== userId)
        return { success: false };

    const updated = await prisma.reglement.update({
        where: { id: reglementId },
        data:  { statut: StatutPaiement.PAYE, dateReglement: new Date() },
        include: REGLE_INCLUDE,
    });

    revalidatePath("/facturation");
    revalidatePath("/dashboard");
    return { success: true, reglement: JSON.parse(JSON.stringify(updated)) };
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIQUE
// ─────────────────────────────────────────────────────────────────────────────
export async function getRecentInvoices() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const userId = (session.user as any).id;

    return await prisma.reglement.findMany({
        where:   { consultation: { userId } },
        include: REGLE_INCLUDE,
        orderBy: { createdAt: "desc" },
        take:    50,
    });
}
