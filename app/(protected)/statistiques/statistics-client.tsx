"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    LineChart, Line, Legend,
} from "recharts";
import {
    Users, CalendarCheck, Baby, TrendingUp, TrendingDown,
    Minus, CreditCard, MessageSquare, Activity,
} from "lucide-react";

type Data = Awaited<ReturnType<typeof import("@/app/actions/statistics").getStatisticsData>>;

const TYPE_COLORS = ["#7c3aed", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"];
const AGE_COLOR   = "#7c3aed";
const MODE_LABELS: Record<string, string> = {
    ESPECES: "Espèces", CHEQUE: "Chèque", CB: "CB",
    VIREMENT: "Virement", SANTE: "Assurance", WAVE: "Wave", ORANGE_MONEY: "Orange Money",
};

function KpiCard({
    label, value, sub, icon: Icon, color, evolution, unit = "",
}: {
    label: string; value: string | number; sub?: string;
    icon: any; color: string; evolution?: number | null; unit?: string;
}) {
    const up   = evolution !== null && evolution !== undefined && evolution > 0;
    const down = evolution !== null && evolution !== undefined && evolution < 0;
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                </div>
                {evolution !== null && evolution !== undefined ? (
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${up ? "bg-emerald-50 text-emerald-600" : down ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-500"}`}>
                        {up ? <TrendingUp className="h-3 w-3" /> : down ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {evolution > 0 ? "+" : ""}{evolution}%
                    </div>
                ) : null}
            </div>
            <div>
                <p className="text-2xl font-black text-slate-900">{value}{unit}</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{label}</p>
                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Activity className="h-3.5 w-3.5" />
            {children}
        </h2>
    );
}

const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-bold text-slate-700 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.name} style={{ color: p.color }} className="font-semibold">
                    {p.value.toLocaleString("fr-FR")} {p.name}
                </p>
            ))}
        </div>
    );
};

export default function StatisticsClient({ data }: { data: Data }) {
    if (!data) {
        return (
            <div className="flex items-center justify-center py-24 text-slate-400">
                <p className="text-sm">Données non disponibles.</p>
            </div>
        );
    }

    const { kpis, monthlyData, repartitionTypes, ageData, modePaiement } = data;
    const smsRate = kpis.consultWithPhoneCount > 0
        ? Math.round((kpis.smsRemindedCount / kpis.consultWithPhoneCount) * 100)
        : 0;
    const hasCA = monthlyData.some(m => m.ca > 0);

    return (
        <div className="space-y-8">

            {/* ── KPIs ──────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Patients suivis"
                    value={kpis.totalPatients}
                    sub="total actif"
                    icon={Users}
                    color="bg-violet-100 text-violet-600"
                />
                <KpiCard
                    label="Consultations ce mois"
                    value={kpis.consultationsThisMonth}
                    evolution={kpis.consultationsEvolution}
                    sub="vs mois précédent"
                    icon={CalendarCheck}
                    color="bg-emerald-100 text-emerald-600"
                />
                <KpiCard
                    label="Nouveaux patients"
                    value={kpis.newPatientsThisMonth}
                    evolution={kpis.newPatientsEvolution}
                    sub="ce mois"
                    icon={Users}
                    color="bg-sky-100 text-sky-600"
                />
                <KpiCard
                    label="Grossesses en cours"
                    value={kpis.grossessesEnCours}
                    sub="suivies activement"
                    icon={Baby}
                    color="bg-pink-100 text-pink-600"
                />
            </div>

            {/* ── Activité mensuelle + Types RDV ───────────────────────── */}
            <div className="grid lg:grid-cols-5 gap-6">
                {/* Activité mensuelle */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <SectionTitle>Activité mensuelle — 6 mois</SectionTitle>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                            <Tooltip content={customTooltip} />
                            <Legend formatter={(v) => v === "consultations" ? "Consultations" : "Nouveaux patients"} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                            <Bar dataKey="consultations" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            <Bar dataKey="nouveauxPatients" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Répartition types RDV */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <SectionTitle>Types de consultations</SectionTitle>
                    {repartitionTypes.length === 0 ? (
                        <div className="flex items-center justify-center h-[200px] text-slate-300 text-sm">Aucune donnée</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={repartitionTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {repartitionTypes.map((_, i) => (
                                            <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => [`${v} acte${v > 1 ? "s" : ""}`, ""]} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / .08)" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {repartitionTypes.map((t, i) => (
                                    <div key={t.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                                            <span className="text-xs text-slate-600 font-medium">{t.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-800">{t.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Tranches d'âge + CA ou SMS ───────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Tranches d'âge */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <SectionTitle>Profil des patientes — tranche d'âge</SectionTitle>
                    {allZero(ageData) ? (
                        <div className="flex items-center justify-center h-[200px] text-slate-300 text-sm">Aucune donnée</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={ageData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
                                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} width={48} />
                                <Tooltip formatter={(v: number) => [`${v} patient${v > 1 ? "s" : ""}`, "Effectif"]} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / .08)" }} />
                                <Bar dataKey="count" fill={AGE_COLOR} radius={[0, 4, 4, 0]} maxBarSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* CA mensuel ou bloc SMS */}
                {hasCA ? (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <SectionTitle>Chiffre d'affaires mensuel (FCFA)</SectionTitle>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={monthlyData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v: number) => [`${v.toLocaleString("fr-FR")} FCFA`, "CA"]} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgb(0 0 0 / .08)" }} />
                                <Line type="monotone" dataKey="ca" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                        <div className="mt-3 flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100">
                            <CreditCard className="h-4 w-4 text-violet-500 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">CA ce mois</p>
                                <p className="text-lg font-black text-violet-700">{kpis.caThisMonth.toLocaleString("fr-FR")} FCFA</p>
                            </div>
                            {kpis.caEvolution !== null && (
                                <div className={`ml-auto flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpis.caEvolution >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                    {kpis.caEvolution >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {kpis.caEvolution > 0 ? "+" : ""}{kpis.caEvolution}%
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                        <SectionTitle>Rappels SMS & Engagement patients</SectionTitle>

                        {/* Taux de rappels */}
                        <div className="p-4 bg-violet-50 rounded-xl border border-violet-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-violet-600" />
                                    <span className="text-sm font-bold text-violet-800">Rappels envoyés ce mois</span>
                                </div>
                                <span className="text-lg font-black text-violet-700">{smsRate}%</span>
                            </div>
                            <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                                <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${smsRate}%` }} />
                            </div>
                            <p className="text-xs text-violet-600 mt-2 font-medium">
                                {kpis.smsRemindedCount} / {kpis.consultWithPhoneCount} patients avec numéro rappelés
                            </p>
                        </div>

                        {/* Modes de paiement */}
                        {modePaiement.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Modes de paiement (6 mois)</p>
                                <div className="space-y-2">
                                    {modePaiement.slice(0, 5).map((m, i) => {
                                        const total = modePaiement.reduce((s, x) => s + x.value, 0);
                                        const pct = Math.round((m.value / total) * 100);
                                        return (
                                            <div key={m.name}>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-semibold text-slate-600">{MODE_LABELS[m.name] || m.name}</span>
                                                    <span className="font-black text-slate-800">{pct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function allZero(data: { count: number }[]) {
    return data.every(d => d.count === 0);
}
