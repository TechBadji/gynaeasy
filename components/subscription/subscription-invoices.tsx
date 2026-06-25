"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

export default function SubscriptionInvoices({ factures, onUpdate }: { factures: any[], onUpdate: () => void }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleDownload = async (facture: any) => {
        setLoading(facture.id);
        setTimeout(() => {
            window.print();
            setLoading(null);
            toast.success("Impression lancée");
        }, 800);
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Mes Factures Gynaeasy</h3>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/30 text-[10px] uppercase font-black text-slate-400 tracking-tighter">
                            <th className="px-6 py-4">N° Facture</th>
                            <th className="px-6 py-4">Période</th>
                            <th className="px-6 py-4">Montant TTC</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {factures.length > 0 ? factures.map((f) => (
                            <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="text-xs font-black text-slate-800">{f.numero}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-500 font-medium">
                                        Du {format(new Date(f.periodeDebut), "dd/MM")} au {format(new Date(f.periodeFin), "dd/MM/yy")}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-slate-900">{f.montantTTC.toLocaleString("fr-FR")} FCFA</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wide">Payée</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDownload(f)}
                                        disabled={loading === f.id}
                                        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        {loading === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                                        PDF
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center space-y-2 opacity-30">
                                        <FileText className="h-10 w-10 text-slate-400" />
                                        <p className="text-xs font-bold text-slate-500">Aucune facture disponible pour le moment.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-[10px] text-slate-500 font-medium">Les factures sont générées le 1er de chaque mois pour la période écoulée.</p>
            </div>
        </div>
    );
}
