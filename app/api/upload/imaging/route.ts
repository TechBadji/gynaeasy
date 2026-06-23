import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SIZE = 8 * 1024 * 1024; // 8 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "MEDECIN") {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentId = formData.get("documentId") as string | null;

    if (!file || !documentId) {
        return NextResponse.json({ error: "Fichier ou documentId manquant" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Format non supporté (JPEG, PNG, WebP uniquement)" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Fichier trop volumineux (max 8 Mo)" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Vérifier que le document appartient au médecin
    const doc = await prisma.document.findFirst({
        where: { id: documentId, patient: { treatingDoctorId: userId } },
        select: { id: true },
    });
    if (!doc) {
        return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    await prisma.document.update({
        where: { id: documentId },
        data: { url: dataUrl },
    });

    return NextResponse.json({ success: true, url: dataUrl });
}
