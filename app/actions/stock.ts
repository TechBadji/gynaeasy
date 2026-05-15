"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Récupère tous les articles en stock
 */
export async function getStockItems() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    return await prisma.stockItem.findMany({
        orderBy: { nom: "asc" }
    });
}

/**
 * Met à jour ou crée un article en stock
 */
export async function updateStockItem(id: string | null, data: {
    nom: string;
    quantite: number;
    unite: string;
    seuilAlerte: number;
    categorie?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Non autorisé" };
    if (id) {
        await prisma.stockItem.update({
            where: { id },
            data
        });
    } else {
        await prisma.stockItem.create({
            data
        });
    }
    revalidatePath("/inventaire");
    return { success: true };
}

/**
 * Consomme une unité d'un article (utilisé par le module imagerie par ex)
 */
export async function consumeStockItem(nom: string, quantity: number = 1) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, message: "Non autorisé" };
    const item = await prisma.stockItem.findFirst({
        where: { nom: { contains: nom, mode: 'insensitive' } }
    });

    if (item && item.quantite > 0) {
        await prisma.stockItem.update({
            where: { id: item.id },
            data: { quantite: item.quantite - quantity }
        });
        revalidatePath("/inventaire");
        revalidatePath("/imagerie");
        return { success: true, remaining: item.quantite - quantity };
    }
    return { success: false, message: "Article non trouvé ou stock épuisé" };
}

/**
 * Supprime un article du stock
 */
export async function deleteStockItem(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { success: false, error: "Non autorisé" };
    await prisma.stockItem.delete({
        where: { id }
    });
    revalidatePath("/inventaire");
    return { success: true };
}
