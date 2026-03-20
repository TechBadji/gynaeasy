"use client";

import { useState, useTransition } from "react";
import { updateActeCCAMAdmin } from "@/app/actions/superadmin";
import { ClipboardList, ToggleLeft, ToggleRight, Pencil, Check, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminCCAM({ actes, searchQuery }: { actes: any[]; searchQuery: string }) {
    const [list, setList] = useState(actes);
    const [isPending, startTransition] = useTransition();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{ tarif: string; libelle: string }>({ tarif: "", libelle: "" });

    const [localSearch, setLocalSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filtered = list.filter((a) => {
        const q = localSearch.toLowerCase() || searchQuery.toLowerCase();
        return !q || a.code?.toLowerCase().includes(q) || a.libelle?.toLowerCase().includes(q) || a.chapitre?.toLowerCase().includes(q);
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination when search changes
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    const toggleActive = (id: string, active: boolean) => {
        startTransition(async () => {
            try {
                await updateActeCCAMAdmin(id, { active: !active });
                setList((prev) => prev.map((a) => a.id === id ? { ...a, active: !active } : a));
                toast.success(active ? "Acte désactivé" : "Acte activé");
            } catch {
                toast.error("Erreur");
            }
        });
    };

    const startEdit = (a: any) => {
        setEditingId(a.id);
        setEditValues({ tarif: String(a.tarif), libelle: a.libelle });
    };

    const saveEdit = (id: string) => {
        startTransition(async () => {
            try {
                const tarif = parseFloat(editValues.tarif);
                if (isNaN(tarif)) { toast.error("Tarif invalide"); return; }
                await updateActeCCAMAdmin(id, { tarif, libelle: editValues.libelle });
                setList((prev) => prev.map((a) => a.id === id ? { ...a, tarif, libelle: editValues.libelle } : a));
                toast.success("Acte mis à jour");
                setEditingId(null);
            } catch {
                toast.error("Erreur");
            }
        });
    };

    const activeCount = list.filter(a => a.active).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Catalogue CCAM</h1>
                    <p className="text-slate-400 text-sm mt-1">{activeCount} / {list.length} actes actifs</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <p className="text-xs text-slate-400">Actifs</p>
                    <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-xs text-slate-400">Désactivés</p>
                    <p className="text-2xl font-bold text-red-400">{list.length - activeCount}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="text-2xl font-bold text-white">{list.length}</p>
                </div>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-medium text-white">Actes médicaux</span>
                        <span className="text-xs text-slate-400">— {filtered.length} résultat(s)</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Recherche rapide (code, libellé...)"
                            value={localSearch}
                            onChange={(e) => {
                                setLocalSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500/50 w-full sm:w-64 transition-colors"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Code</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Libellé</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Chapitre</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tarif (FCFA)</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedItems.length > 0 ? paginatedItems.map((acte) => (
                                <tr key={acte.id} className={`hover:bg-white/3 transition-colors ${!acte.active ? "opacity-50" : ""}`}>
                                    <td className="px-4 py-3 font-mono text-violet-300 text-xs">{acte.code}</td>
                                    <td className="px-4 py-3 max-w-xs">
                                        {editingId === acte.id ? (
                                            <input
                                                value={editValues.libelle}
                                                onChange={(e) => setEditValues((p) => ({ ...p, libelle: e.target.value }))}
                                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500/50 w-full"
                                            />
                                        ) : (
                                            <span className="text-slate-200 text-xs line-clamp-2">{acte.libelle}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">{acte.chapitre || "—"}</td>
                                    <td className="px-4 py-3">
                                        {editingId === acte.id ? (
                                            <input
                                                type="number"
                                                value={editValues.tarif}
                                                onChange={(e) => setEditValues((p) => ({ ...p, tarif: e.target.value }))}
                                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-violet-500/50 w-28"
                                            />
                                        ) : (
                                            <span className="text-emerald-400 font-semibold text-sm">{acte.tarif?.toLocaleString("fr-FR")}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${acte.active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                            {acte.active ? "Actif" : "Inactif"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {editingId === acte.id ? (
                                                <>
                                                    <button onClick={() => saveEdit(acte.id)} disabled={isPending} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300 transition-colors">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => startEdit(acte)} className="text-slate-400 hover:text-white transition-colors">
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button onClick={() => toggleActive(acte.id, acte.active)} disabled={isPending} className="text-slate-400 hover:text-white transition-colors">
                                                        {acte.active
                                                            ? <ToggleRight className="h-4 w-4 text-emerald-400" />
                                                            : <ToggleLeft className="h-4 w-4 text-red-400" />
                                                        }
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        Aucun acte trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Affichage {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} sur {filtered.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 rounded bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-xs text-white px-3 font-medium">
                                Page {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
