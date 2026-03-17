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

    // Récupérer les statistiques réelles
    const totalPatients = await prisma.patient.count();
    const consultationsAujourdhui = await prisma.consultation.count({
        where: {
            dateHeure: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
            }
        }
    });

    // Récupérer les demandes d'accès en attente pour ce médecin
    const pendingRequests = await prisma.accessRequest.findMany({
        where: {
            patient: {
                treatingDoctorId: userId
            },
            status: "PENDING"
        },
        include: {
            doctor: {
                select: { name: true }
            },
            patient: {
                select: { nom: true, prenom: true, codePatient: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });

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
                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPatients}</div>
                        <p className="text-xs text-slate-500">+12% depuis le mois dernier</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">RDV Aujourd&apos;hui</CardTitle>
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{consultationsAujourdhui}</div>
                        <p className="text-xs text-slate-500">3 urgences, 4 suivis de grossesse</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grossesses suivies</CardTitle>
                        <Activity className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-slate-500">3 accouchements prévus ce mois</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CA Estimé (Jour)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(250000)}</div>
                        <p className="text-xs text-slate-500">Basé sur cotations CCAM prévues</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Agenda du jour</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UpcomingAppointments doctorId={role === "MEDECIN" ? userId : undefined} />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Alertes & Suivi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AlertsList />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
