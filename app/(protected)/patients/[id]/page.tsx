import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PatientClient } from "@/components/patients/patient-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Lock } from "lucide-react";
import Link from "next/link";
import AccessRequestButton from "@/components/patients/access-request-button";

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
        where: { id: id },
        include: {
            grossesses: {
                orderBy: { createdAt: 'desc' }
            },
            consultations: {
                orderBy: { dateHeure: 'desc' },
                include: {
                    actes: {
                        include: { acte: true }
                    },
                    reglement: true
                }
            }
        }
    });

    if (!patient) return notFound();

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any).id;

    // Vérification de l'accès
    const isTreatingDoctor = patient.treatingDoctorId === userId;
    const isPublic = patient.isPublic;

    // Vérifier s'il y a une demande d'accès acceptée (pour les médecins tiers)
    const hasGrantedAccess = await prisma.accessRequest.findFirst({
        where: {
            patientId: id,
            doctorId: userId,
            status: "GRANTED",
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        }
    });

    if (!isTreatingDoctor && !isPublic && !hasGrantedAccess) {
        // Rediriger vers une page de demande d'accès ou afficher un message restreint
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="h-20 w-20 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600">
                    <Lock className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Accès Restreint</h2>
                <p className="text-slate-500 max-w-sm">
                    Ce dossier est configuré comme <span className="font-bold text-amber-600">Privé</span>.
                    Seul le médecin traitant peut y accéder directement.
                </p>
                <div className="pt-4 flex gap-4">
                    <Link href="/patients" className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium">
                        Retour
                    </Link>
                    <AccessRequestButton patientId={id} />
                </div>
            </div>
        );
    }

    // Serialize dates for client component
    const serializedPatient = {
        ...patient,
        dateNaissance: patient.dateNaissance.toISOString(),
        consentementDate: patient.consentementDate?.toISOString() || null,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
        grossesses: patient.grossesses.map(g => ({
            ...g,
            ddr: g.ddr?.toISOString() || null,
            dpa: g.dpa?.toISOString() || null,
            createdAt: g.createdAt.toISOString(),
            updatedAt: g.updatedAt.toISOString(),
        })),
        consultations: patient.consultations.map(c => ({
            ...c,
            dateHeure: c.dateHeure.toISOString(),
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
            actes: c.actes.map(a => ({
                ...a,
                createdAt: a.createdAt.toISOString(),
                acte: {
                    ...a.acte,
                    createdAt: a.acte.createdAt.toISOString(),
                    updatedAt: a.acte.updatedAt.toISOString(),
                }
            })),
            reglement: c.reglement ? {
                ...c.reglement,
                dateReglement: c.reglement.dateReglement?.toISOString() || null,
                createdAt: c.reglement.createdAt.toISOString(),
                updatedAt: c.reglement.updatedAt.toISOString(),
            } : null
        }))
    };

    return <PatientClient patient={serializedPatient as any} />;
}
