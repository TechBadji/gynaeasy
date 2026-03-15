"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";

// Dummy Data
const CA_PAR_MOIS = [
    { name: 'Jan', total: 7200000 },
    { name: 'Fév', total: 8100000 },
    { name: 'Mar', total: 7050000 },
    { name: 'Avr', total: 8800000 },
    { name: 'Mai', total: 9350000 },
    { name: 'Juin', total: 8450000 },
];

const REPARTITION_ACTES = [
    { name: 'Consultations', value: 45 },
    { name: 'Échographies (T1/T2/T3)', value: 30 },
    { name: 'Urgences', value: 10 },
    { name: 'Frottis/Actes annexes', value: 15 },
];

const EVOLUTION_PATIENTS = [
    { name: 'S1', nouveaux: 12 },
    { name: 'S2', nouveaux: 18 },
    { name: 'S3', nouveaux: 15 },
    { name: 'S4', nouveaux: 22 },
];

const PIE_COLORS = ['#db2777', '#f472b6', '#fbbf24', '#cbd5e1'];

export default function StatisticsClient() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Statistiques & Analyse</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Chiffre d'Affaires Mensuel */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Chiffre d&apos;Affaires Mensuel (CCAM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={CA_PAR_MOIS} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `${value.toLocaleString()} FCFA`} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'CA']}
                                    />
                                    <Bar dataKey="total" fill="#db2777" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Répartition de l'Activité Médicale */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Répartition de l&apos;Activité Médicale</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={REPARTITION_ACTES}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {REPARTITION_ACTES.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`${value}%`, 'Part']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {REPARTITION_ACTES.map((item, index) => (
                                <div key={item.name} className="flex items-center text-xs text-slate-600">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index] }}></span>
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Acquisition Patients */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Nouveaux Patients ce Mois-ci</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={EVOLUTION_PATIENTS} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [`${value} patients`, 'Nouveaux']}
                                    />
                                    <Line type="bump" dataKey="nouveaux" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
