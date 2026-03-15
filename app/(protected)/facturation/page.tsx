import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillingDashboard from "@/components/billing/billing-dashboard";
import { getClinicSettings } from "@/app/actions/clinic";

export default async function FacturationPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    // Récupérer les données en parallèle
    const [recentInvoices, pendingConsultations, clinicSettings] = await Promise.all([
        prisma.reglement.findMany({
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
        }),
        prisma.consultation.findMany({
            where: {
                reglement: {
                    is: null
                },
                dateHeure: {
                    lte: new Date()
                }
            },
            include: {
                patient: {
                    select: { nom: true, prenom: true, codePatient: true }
                },
                user: {
                    select: { name: true }
                }
            },
            orderBy: { dateHeure: "desc" }
        }),
        getClinicSettings()
    ]);

    return (
        <BillingDashboard
            recentInvoices={recentInvoices}
            pendingConsultations={pendingConsultations}
            clinicSettings={clinicSettings}
        />
    );
}
