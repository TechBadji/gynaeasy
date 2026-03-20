import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Users, Activity, CalendarDays, TrendingUp } from "lucide-react";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import AlertsList from "@/components/dashboard/alerts-list";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AccessRequestsList from "@/components/dashboard/access-requests-list";
import Link from "next/link";
import QuickRdvSearch from "@/components/dashboard/quick-rdv-search";
import SmsRemindersCard from "@/components/dashboard/sms-reminders-card";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const userId = (session?.user as any).id;
    const role = (session?.user as any).role;

    const today = {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999)),
    };

    // Toutes les stats sont filtrées par userId — aucune fuite inter-cabinets
    const [
        totalPatients,
        consultationsAujourdhui,
        grossessesActives,
        reglementsDuJour,
        pendingRequests
    ] = await Promise.all([
        // Patients dont ce médecin est le soignant référent
        prisma.patient.count({
            where: { treatingDoctorId: userId }
        }),
        // RDV d'aujourd'hui pour ce médecin
        prisma.consultation.count({
            where: { userId, dateHeure: today }
        }),
        // Grossesses en cours pour les patients de ce médecin
        prisma.grossesse.count({
            where: {
                statut: "EN_COURS",
                patient: { treatingDoctorId: userId }
            }
        }),
        // CA du jour : somme des règlements payés des consultations de ce médecin
        prisma.reglement.aggregate({
            _sum: { montant: true },
            where: {
                statut: "PAYE",
                consultation: {
                    userId,
                    dateHeure: today
                }
            }
        }),
        // Demandes d'accès en attente pour ce médecin
        prisma.accessRequest.findMany({
            where: {
                patient: { treatingDoctorId: userId },
                status: "PENDING"
            },
            include: {
                doctor: { select: { name: true } },
                patient: { select: { nom: true, prenom: true, codePatient: true } }
            },
            orderBy: { createdAt: "desc" }
        })
    ]);

    const caJour = reglementsDuJour._sum.montant || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    {role === "SECRETAIRE" ? "Espace Secrétariat" : "Tableau de bord"}
                </h1>
            </div>

            {role === "SECRETAIRE" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border-2 border-indigo-100 rounded-2xl p-6 shadow-sm flex flex-col items-start justify-between gap-6">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900">Bienvenue au Secrétariat</h2>
                            <p className="text-slate-500">Gérez les rendez-vous et la facturation du cabinet.</p>
                        </div>
                        <QuickRdvSearch />
                    </div>
                    <SmsRemindersCard />
                </div>
            )}

            {role === "MEDECIN" && <AccessRequestsList initialRequests={pendingRequests} />}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mes Patients</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPatients}</div>
                        <p className="text-xs text-slate-500">Patients enregistrés dans votre cabinet</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">RDV Aujourd&apos;hui</CardTitle>
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{consultationsAujourdhui}</div>
                        <p className="text-xs text-slate-500">Consultations planifiées ce jour</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grossesses suivies</CardTitle>
                        <Activity className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{grossessesActives}</div>
                        <p className="text-xs text-slate-500">Grossesses en cours dans votre cabinet</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CA Aujourd&apos;hui</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(caJour)}</div>
                        <p className="text-xs text-slate-500">Règlements encaissés ce jour</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Agenda du jour</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UpcomingAppointments doctorId={userId} />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Alertes &amp; Suivi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AlertsList doctorId={userId} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
