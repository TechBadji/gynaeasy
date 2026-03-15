"use client";

import { Users, Activity, CreditCard, TrendingUp, Stethoscope, UserCheck, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const PLAN_COLORS: Record<string, string> = {
    BASIQUE: "bg-slate-500",
    PRO: "bg-violet-500",
    PREMIUM: "bg-amber-500",
};

export default function SuperAdminOverview({ stats }: { stats: any }) {
    const { kpis, recentConsultations, consultationsByMonth, usersByRole, abonnementsByPlan } = stats;

    const kpiCards = [
        {
            label: "Utilisateurs actifs",
            value: kpis.totalUsers,
            sub: `${kpis.totalUsers} comptes enregistrés`,
            icon: Users,
            color: "from-violet-500 to-purple-600",
            bg: "bg-violet-500/10",
            border: "border-violet-500/20",
        },
        {
            label: "Patients gérés",
            value: kpis.totalPatients,
            sub: `+${kpis.patientsThisMonth} ce mois`,
            icon: UserCheck,
            color: "from-pink-500 to-rose-600",
            bg: "bg-pink-500/10",
            border: "border-pink-500/20",
        },
        {
            label: "Consultations",
            value: kpis.totalConsultations,
            sub: `+${kpis.consultationsThisMonth} ce mois`,
            icon: Stethoscope,
            color: "from-cyan-500 to-blue-600",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
        },
        {
            label: "Revenus Totaux",
            value: formatCurrency(kpis.totalRevenue),
            sub: `${kpis.totalAbonnements} abonnements actifs`,
            icon: CreditCard,
            color: "from-emerald-500 to-teal-600",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
    ];

    const maxMonth = Math.max(...consultationsByMonth.map((m: any) => m.count), 1);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Vue d&apos;ensemble SaaS</h1>
                <p className="text-slate-400 text-sm mt-1">Métriques globales de la plateforme Gynaeasy</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpiCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`rounded-xl border ${card.border} ${card.bg} p-5 relative overflow-hidden`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                    <Icon className="h-5 w-5 text-white" />
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
                            <div className="text-xs text-slate-400">{card.label}</div>
                            <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Consultations par mois */}
                <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10 p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-4 w-4 text-violet-400" />
                        <h2 className="font-semibold text-white text-sm">Consultations — 6 derniers mois</h2>
                    </div>
                    <div className="flex items-end gap-3 h-40">
                        {consultationsByMonth.map((m: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs text-slate-400">{m.count}</span>
                                <div
                                    className="w-full rounded-t bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-700"
                                    style={{ height: `${(m.count / maxMonth) * 100}%`, minHeight: m.count > 0 ? "4px" : "0" }}
                                />
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Répartition */}
                <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-4">
                    <div>
                        <h2 className="font-semibold text-white text-sm mb-3">Rôles utilisateurs</h2>
                        <div className="space-y-2">
                            {usersByRole.map((r: any) => (
                                <div key={r.role} className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{r.role}</span>
                                    <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full">
                                        {r._count.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                        <h2 className="font-semibold text-white text-sm mb-3">Abonnements actifs</h2>
                        <div className="space-y-2">
                            {abonnementsByPlan.length > 0 ? abonnementsByPlan.map((a: any) => (
                                <div key={a.plan} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${PLAN_COLORS[a.plan] || "bg-slate-500"}`} />
                                        <span className="text-xs text-slate-400">{a.plan}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full">
                                        {a._count.plan}
                                    </span>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-500 italic">Aucun abonnement actif</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent consultations */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-2 mb-5">
                    <Activity className="h-4 w-4 text-pink-400" />
                    <h2 className="font-semibold text-white text-sm">Dernières consultations créées</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {recentConsultations.length > 0 ? recentConsultations.map((c: any) => (
                        <div key={c.id} className="py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center text-xs font-bold">
                                    {c.patient.nom?.[0]}{c.patient.prenom?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{c.patient.nom} {c.patient.prenom}</p>
                                    <p className="text-xs text-slate-400">{c.user.name || c.user.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">{c.type.replace(/_/g, " ")}</span>
                                <p className="text-xs text-slate-500 mt-1">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-slate-500 py-4 text-center">Aucune consultation récente</p>
                    )}
                </div>
            </div>
        </div>
    );
}
