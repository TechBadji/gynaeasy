import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { PrescriptionDocument } from "@/components/documents/prescription-pdf";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return new NextResponse("Non autorisé", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const consultationId = searchParams.get("consultationId");

    if (!consultationId) {
        return new NextResponse("consultationId requis", { status: 400 });
    }

    const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
            patient: true,
            user: true,
        },
    });

    if (!consultation) {
        return new NextResponse("Consultation introuvable", { status: 404 });
    }

    const userId = (session.user as any).id;
    if (consultation.userId !== userId && (session.user as any).role !== "ADMIN") {
        return new NextResponse("Accès refusé", { status: 403 });
    }

    const { patient, user: doctor } = consultation;

    const birthDate = patient.dateNaissance ? new Date(patient.dateNaissance) : null;
    const age = birthDate
        ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

    const medecin = {
        nom: doctor.name ?? "Dr.",
        specialite: (doctor as any).specialite ?? "Gynécologue",
        adresse: (doctor as any).clinicName ?? "",
        rpps: "",
        telephone: "",
    };

    const patientData = {
        nomComplet: `${patient.civilite ?? ""} ${patient.nom.toUpperCase()} ${patient.prenom}`.trim(),
        age,
        dateNaissance: birthDate
            ? birthDate.toLocaleDateString("fr-FR")
            : "",
    };

    const donnees = (consultation.donneesMedicales as any) ?? {};
    const prescriptions: { nom: string; posologie: string }[] =
        Array.isArray(donnees?.prescriptions) ? donnees.prescriptions : [];

    try {
        const stream = await renderToStream(
            PrescriptionDocument({
                medecin,
                patient: patientData,
                date: new Date().toLocaleDateString("fr-FR"),
                prescriptions,
            })
        );

        return new NextResponse(stream as unknown as ReadableStream, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'inline; filename="ordonnance.pdf"',
            },
        });
    } catch (error) {
        console.error("PDF generation failed:", error);
        return new NextResponse("Failed to generate PDF", { status: 500 });
    }
}
