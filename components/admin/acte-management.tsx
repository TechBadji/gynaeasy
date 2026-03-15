"use client";

import { useState } from "react";
import { updateActeCCAM } from "@/app/actions/settings";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Power, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ActeManagement({ actes }: { actes: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleStatus = async (acte: any) => {
        setLoading(acte.id);
        try {
            await updateActeCCAM(acte.id, { active: !acte.active });
            toast.success(`Acte ${acte.active ? "désactivé" : "activé"}`);
            // Note: In a real app, we'd probably use useOptimistic or mutate from SWR/Query
            // but revalidatePath handles it for this demo.
            acte.active = !acte.active;
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(null);
        }
    };

    const filteredActes = actes.filter(a =>
        a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-pink-600" />
                        Catalogue des Actes CCAM
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-1">{actes.length} actes référencés dans la base</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Filtrer par code ou libellé..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Code</th>
                                <th className="px-6 py-3 font-medium">Libellé</th>
                                <th className="px-6 py-3 font-medium text-right">Tarif (FCFA)</th>
                                <th className="px-6 py-3 font-medium text-center">Statut</th>
                                <th className="px-6 py-3 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActes.map((acte) => (
                                <tr key={acte.id} className={`border-b transition-colors ${!acte.active ? "bg-slate-50/50 opacity-60" : "hover:bg-slate-50"}`}>
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{acte.code}</td>
                                    <td className="px-6 py-4 text-slate-700 max-w-md">
                                        <div className="line-clamp-2" title={acte.libelle}>{acte.libelle}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-right whitespace-nowrap">{formatCurrency(acte.tarif)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${acte.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                                            }`}>
                                            {acte.active ? "Actif" : "Inactif"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            disabled={loading === acte.id}
                                            onClick={() => toggleStatus(acte)}
                                            className={`p-2 rounded-md transition-colors ${acte.active ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"
                                                }`}
                                            title={acte.active ? "Désactiver" : "Activer"}
                                        >
                                            <Power className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredActes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Aucun acte ne correspond à votre recherche.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
