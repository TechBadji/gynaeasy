import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import {
    Users, CalendarDays, Activity, TrendingUp,
    ArrowUpRight, ArrowDownRight, UserPlus, Calendar,
    BarChart3, MessageSquare, CreditCard, Megaphone,
} from "lucide-react";
import UpcomingAppointments from "@/components/dashboard/upcoming-appointments";
import AlertsList from "@/components/dashboard/alerts-list";
import AccessRequestsList from "@/components/dashboard/access-requests-list";
import QuickRdvSearch from "@/components/dashboard/quick-rdv-search";
import SmsRemindersCard from "@/components/dashboard/sms-reminders-card";
import NextAppointmentCard from "@/components/dashboard/next-appointment-card";
import GrossessesProches from "@/components/dashboard/grossesses-proches";
import { getEffectiveDoctorId, getLinkedDoctor } from "@/lib/effective-user";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const userId   = (session.user as any).id;
    const role     = (session.user as any).role;
    const userName = session.user?.name ?? "";
    const PREFIXES = new Set(["dr", "dr.", "pr", "pr.", "m.", "mme", "mlle"]);
    const firstName = userName.split(" ").find((w: string) => w.length > 1 && !PREFIXES.has(w.toLowerCase())) ?? (role === "SECRETAIRE" ? "Secrétaire" : "Docteur");

    // Pour secrétaire : toutes les données sont filtrées sur le médecin lié
    const [doctorId, linkedDoctor] = await Promise.all([
        getEffectiveDoctorId(userId, role),
        getLinkedDoctor(userId, role),
    ]);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 17 ? "Bon après-midi" : "Bonsoir";
    const dateFormatted = (() => {
        const d = format(now, "EEEE d MMMM yyyy", { locale: fr });
        return d.charAt(0).toUpperCase() + d.slice(1);
    })();

    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
    const yStart     = new Date(todayStart); yStart.setDate(yStart.getDate() - 1);
    const yEnd       = new Date(todayEnd);   yEnd.setDate(yEnd.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const in30Days   = new Date(now); in30Days.setDate(in30Days.getDate() + 30);

    const [
        totalPatients,
        rdvAujourdhui,
        rdvHier,
        grossessesActives,
        grossessesProches,
        regJour,
        regHier,
        nouveauxPatientsMois,
        prochainRDV,
        pendingRequests,
        initialAlerts,
        unreadCount,
    ] = await Promise.all([
        prisma.patient.count({ where: { treatingDoctorId: doctorId } }),
        prisma.consultation.count({ where: { userId: doctorId, dateHeure: { gte: todayStart, lte: todayEnd } } }),
        prisma.consultation.count({ where: { userId: doctorId, dateHeure: { gte: yStart,     lte: yEnd } } }),
        prisma.grossesse.count({ where: { statut: "EN_COURS", patient: { treatingDoctorId: doctorId } } }),
        prisma.grossesse.findMany({
            where: { statut: "EN_COURS", dpa: { gte: now, lte: in30Days }, patient: { treatingDoctorId: doctorId } },
            include: { patient: { select: { nom: true, prenom: true, id: true } } },
            orderBy: { dpa: "asc" },
            take: 5,
        }),
        prisma.reglement.aggregate({ _sum: { montant: true }, where: { statut: "PAYE", consultation: { userId: doctorId, dateHeure: { gte: todayStart, lte: todayEnd } } } }),
        prisma.reglement.aggregate({ _sum: { montant: true }, where: { statut: "PAYE", consultation: { userId: doctorId, dateHeure: { gte: yStart, lte: yEnd } } } }),
        prisma.patient.count({ where: { treatingDoctorId: doctorId, createdAt: { gte: monthStart } } }),
        prisma.consultation.findFirst({
            where: { userId: doctorId, dateHeure: { gt: now } },
            include: { patient: { select: { nom: true, prenom: true, id: true } } },
            orderBy: { dateHeure: "asc" },
        }),
        prisma.accessRequest.findMany({
            where: { patient: { treatingDoctorId: doctorId }, status: "PENDING" },
            include: {
                doctor:  { select: { name: true } },
                patient: { select: { nom: true, prenom: true, codePatient: true } },
            },
            orderBy: { createdAt: "desc" },
        }),
        prisma.notification.findMany({
            where: { userId, read: false },
            orderBy: { createdAt: "desc" },
            take: 8,
        }),
        prisma.notification.count({ where: { userId, read: false } }),
    ]);

    const caJour = regJour._sum.montant ?? 0;
    const caHier = regHier._sum.montant ?? 0;

    // Trends RDV
    const rdvDiff = rdvAujourdhui - rdvHier;
    const rdvTrend = rdvHier === 0
        ? { label: rdvAujourdhui > 0 ? `+${rdvAujourdhui} vs hier` : "Aucun hier", neutral: rdvAujourdhui === 0, up: true }
        : { label: `${rdvDiff >= 0 ? "+" : ""}${rdvDiff} vs hier`, neutral: rdvDiff === 0, up: rdvDiff >= 0 };

    // Trends CA
    const caTrend = caHier === 0
        ? { label: caJour > 0 ? "Premier encaissement" : "Aucun règlement", neutral: caJour === 0, up: caJour > 0 }
        : (() => {
            const pct = Math.round(((caJour - caHier) / caHier) * 100);
            return { label: `${pct >= 0 ? "+" : ""}${pct}% vs hier`, neutral: false, up: pct >= 0 };
        })();

    const fmtCFA = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";

    // Serialize dates for client components
    const prochainRDVSer = prochainRDV ? {
        ...prochainRDV,
        dateHeure: prochainRDV.dateHeure.toISOString(),
        createdAt: prochainRDV.createdAt.toISOString(),
        updatedAt: prochainRDV.updatedAt.toISOString(),
    } : null;

    const grossessesProSer = grossessesProches.map((g: any) => ({
        ...g,
        dpa: g.dpa?.toISOString() ?? null,
        ddr: g.ddr?.toISOString() ?? null,
        createdAt: g.createdAt.toISOString(),
        updatedAt: g.updatedAt.toISOString(),
    }));

    const alertsSer = initialAlerts.map((n: any) => ({
        id:        n.id,
        titre:     n.titre,
        message:   n.message,
        type:      n.type,
        link:      n.link ?? null,
        createdAt: n.createdAt.toISOString(),
    }));

    return (
        <div className="space-y-6 pb-8">
            {/* Bannière secrétaire — médecin lié */}
            {role === "SECRETAIRE" && (
                linkedDoctor ? (
                    <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                        <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                            {linkedDoctor.name?.[0] ?? "D"}
                        </div>
                        <div>
                            <p className="text-xs font-black text-violet-500 uppercase tracking-widest">Cabinet rattaché</p>
                            <p className="text-sm font-bold text-violet-800">{linkedDoctor.name}{linkedDoctor.specialite ? ` — ${linkedDoctor.specialite}` : ""}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z"/></svg>
                        </div>
                        <div>
                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Aucun médecin associé</p>
                            <p className="text-sm text-amber-700">Votre compte n&apos;est pas encore rattaché à un médecin. Contactez l&apos;administrateur.</p>
                        </div>
                    </div>
                )
            )}
            {/* ══════════════════════════════════════════
                GREETING HEADER
            ══════════════════════════════════════════ */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        {greeting}{role === "MEDECIN" ? ", Dr. " : ", "}{firstName}
                    </h1>
                    <p className="text-sm text-slate-400 font-medium mt-0.5">{dateFormatted}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {role === "MEDECIN" && (
                        <>
                            <Link href="/patients?new=true"
                                className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                <UserPlus className="h-3.5 w-3.5" /> Nouveau patient
                            </Link>
                            <Link href="/statistiques"
                                className="hidden md:flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                                <BarChart3 className="h-3.5 w-3.5" /> Statistiques
                            </Link>
                        </>
                    )}
                    <Link href="/agenda?new=true"
                        className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-violet-100">
                        <Calendar className="h-3.5 w-3.5" /> Nouveau RDV
                    </Link>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                KPI CARDS
            ══════════════════════════════════════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Patients */}
                <Link href="/patients" className="block">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-violet-100 transition-all h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-11 w-11 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 whitespace-nowrap">
                                {nouveauxPatientsMois > 0 ? `+${nouveauxPatientsMois} ce mois` : "Stables"}
                            </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tabular-nums">{totalPatients}</div>
                        <div className="text-sm font-bold text-slate-600 mt-1">Mes Patients</div>
                        <div className="text-xs text-slate-400 mt-0.5">Dossiers actifs au cabinet</div>
                    </div>
                </Link>

                {/* RDV Aujourd'hui */}
                <Link href="/agenda" className="block">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-0.5 whitespace-nowrap ${rdvTrend.neutral ? "bg-slate-50 text-slate-500 border-slate-200" : rdvTrend.up ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                                {!rdvTrend.neutral && (rdvTrend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
                                {rdvTrend.label}
                            </span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 tabular-nums">{rdvAujourdhui}</div>
                        <div className="text-sm font-bold text-slate-600 mt-1">RDV Aujourd&apos;hui</div>
                        <div className="text-xs text-slate-400 mt-0.5">Consultations planifiées</div>
                    </div>
                </Link>

                {/* Grossesses */}
                <Link href="/patients" className="block">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-pink-100 transition-all h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-11 w-11 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                                <Activity className="h-5 w-5" />
                            </div>
                            {grossessesProches.length > 0 ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 whitespace-nowrap">
                                    {grossessesProches.length} terme{grossessesProches.length > 1 ? "s" : ""} &lt;30j
                                </span>
                            ) : (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    Aucun terme proche
                                </span>
                            )}
                        </div>
                        <div className="text-3xl font-black text-slate-900 tabular-nums">{grossessesActives}</div>
                        <div className="text-sm font-bold text-slate-600 mt-1">Grossesses suivies</div>
                        <div className="text-xs text-slate-400 mt-0.5">En cours dans votre cabinet</div>
                    </div>
                </Link>

                {/* CA Jour */}
                <Link href="/facturation" className="block">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-emerald-100 transition-all h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-0.5 whitespace-nowrap ${caTrend.neutral ? "bg-slate-50 text-slate-500 border-slate-200" : caTrend.up ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                                {!caTrend.neutral && (caTrend.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />)}
                                {caTrend.label}
                            </span>
                        </div>
                        <div className="text-xl font-black text-slate-900 tabular-nums leading-tight">{fmtCFA(caJour)}</div>
                        <div className="text-sm font-bold text-slate-600 mt-1">CA Aujourd&apos;hui</div>
                        <div className="text-xs text-slate-400 mt-0.5">Règlements encaissés</div>
                    </div>
                </Link>
            </div>

            {/* ══════════════════════════════════════════
                SECRÉTARIAT — Planification rapide
            ══════════════════════════════════════════ */}
            {role === "SECRETAIRE" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100">
                        <div className="mb-5">
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-indigo-200" />
                                Planifier un rendez-vous
                            </h2>
                            <p className="text-indigo-200 text-sm mt-0.5">Recherchez un patient puis sélectionnez un créneau dans l&apos;agenda</p>
                        </div>
                        <QuickRdvSearch />
                    </div>
                    <SmsRemindersCard />
                </div>
            )}

            {/* ══════════════════════════════════════════
                DEMANDES D'ACCÈS (médecin uniquement)
            ══════════════════════════════════════════ */}
            {role === "MEDECIN" && pendingRequests.length > 0 && (
                <AccessRequestsList initialRequests={pendingRequests} />
            )}

            {/* ══════════════════════════════════════════
                MAIN GRID
            ══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Colonne gauche (2/3) ── */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Prochain patient */}
                    <NextAppointmentCard prochainRDV={prochainRDVSer} />

                    {/* Agenda du jour */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                                <h2 className="text-sm font-black text-slate-900">Agenda du jour</h2>
                                {rdvAujourdhui > 0 && (
                                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                                        {rdvAujourdhui} RDV
                                    </span>
                                )}
                            </div>
                            <Link href="/agenda"
                                className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1">
                                Agenda complet <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                        <div className="p-4">
                            <UpcomingAppointments doctorId={userId} />
                        </div>
                    </div>
                </div>

                {/* ── Colonne droite (1/3) ── */}
                <div className="space-y-4">
                    {/* Alertes */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <AlertsList initialAlerts={alertsSer} unreadCount={unreadCount} />
                    </div>

                    {/* Grossesses proches du terme */}
                    {role === "MEDECIN" && grossessesProSer.length > 0 && (
                        <GrossessesProches grossesses={grossessesProSer} />
                    )}

                    {/* Actions rapides secrétariat */}
                    {role === "SECRETAIRE" && (
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <h3 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
                                <ArrowUpRight className="h-4 w-4 text-slate-400" /> Actions rapides
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { href: "/facturation", icon: CreditCard, bg: "bg-emerald-100 text-emerald-600", label: "Facturation", sub: "Gérer les règlements" },
                                    { href: "/sms",         icon: MessageSquare, bg: "bg-blue-100 text-blue-600",    label: "Communications SMS", sub: "Rappels et messages" },
                                    { href: "/inventaire",  icon: BarChart3,     bg: "bg-amber-100 text-amber-600",  label: "Stocks", sub: "Inventaire du cabinet" },
                                ].map(({ href, icon: Icon, bg, label, sub }) => (
                                    <Link key={href} href={href}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{label}</p>
                                            <p className="text-xs text-slate-400">{sub}</p>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-violet-400 transition-colors ml-auto" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
