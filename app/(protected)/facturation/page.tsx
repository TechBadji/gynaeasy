export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEffectiveDoctorId } from "@/lib/effective-user";
import BillingDashboard from "@/components/billing/billing-dashboard";
import { getClinicSettings } from "@/app/actions/clinic";

export default async function FacturationPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    const userId   = (session.user as any).id;
    const role     = (session.user as any).role;
    const doctorId = await getEffectiveDoctorId(userId, role);

    const [recentInvoices, pendingConsultations, clinicSettings] = await Promise.all([
        prisma.reglement.findMany({
            where: { consultation: { userId: doctorId } },
            include: {
                consultation: {
                    include: {
                        patient: { select: { nom: true, prenom: true, codePatient: true } },
                        user:    { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),
        prisma.consultation.findMany({
            where: {
                userId:     doctorId,
                reglement:  { is: null },
                dateHeure:  { lte: new Date() },
            },
            include: {
                patient: { select: { nom: true, prenom: true, codePatient: true } },
                user:    { select: { name: true } },
            },
            orderBy: { dateHeure: "desc" },
        }),
        getClinicSettings(),
    ]);

    return (
        <BillingDashboard
            recentInvoices={recentInvoices}
            pendingConsultations={pendingConsultations}
            clinicSettings={clinicSettings}
        />
    );
}
