import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { PrescriptionDocument } from "@/components/documents/prescription-pdf";

export async function GET(req: Request) {
    // Normally we would parse searchParams to get patientId or consultationId 
    // and fetch the actual data securely from the database.

    // Dummy Data for demonstration
    const medecin = {
        nom: "Dr. LEYDIER Sophie",
        specialite: "Gynécologue-Obstétricien",
        adresse: "Centre Médical Santé+, 75008 Paris",
        rpps: "10002345678",
        telephone: "01 23 45 67 89",
    };

    const patient = {
        nomComplet: "Mme DUBOIS Sophie",
        age: 32,
        dateNaissance: "15/04/1992",
    };

    const prescriptions = [
        { nom: "ACIDE FOLIQUE 5mg", posologie: "1 comprimé par jour pendant 1 mois." },
        { nom: "SPASFON", posologie: "2 comprimés en cas de douleurs, max 3 fois/jour." },
        { nom: "FERO-GRADUMET", posologie: "1 comprimé le matin à jeun avec un jus d'orange." },
    ];

    try {
        const stream = await renderToStream(
            PrescriptionDocument({
                medecin,
                patient,
                date: new Date().toLocaleDateString("fr-FR"),
                prescriptions
            })
        );

        return new NextResponse(stream as unknown as ReadableStream, {
            headers: {
                "Content-Type": "application/pdf",
                // remove "attachment" to display inline in browser instead of forcing download
                "Content-Disposition": 'inline; filename="ordonnance.pdf"',
            },
        });
    } catch (error) {
        console.error("PDF generation failed:", error);
        return new NextResponse("Failed to generate PDF", { status: 500 });
    }
}
