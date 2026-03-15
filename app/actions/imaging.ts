"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveImagingReport(documentId: string, description: string, metadata: any) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "MEDECIN") {
        throw new Error("Seuls les médecins peuvent rédiger des comptes-rendus");
    }

    const updated = await prisma.document.update({
        where: { id: documentId },
        data: {
            description,
            metadata: metadata || {}
        }
    });

    revalidatePath("/imagerie");
    return { success: true, document: updated };
}
