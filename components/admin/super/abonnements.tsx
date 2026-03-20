"use client";

import { useState, useTransition } from "react";
import { updateAbonnement, createAbonnement } from "@/app/actions/superadmin";
import { CreditCard, PlusCircle, CheckCircle2, XCircle, Clock, ChevronDown, Shield } from "lucide-react";
import toast from "react-hot-toast";

const PLAN_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    CLINIQUE: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    PRO: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30" },
    SOLO: { color: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/30" },
};

const STATUT_CONFIG: Record<string, { icon: any; color: string }> = {
    ACTIF: { icon: CheckCircle2, color: "text-emerald-400" },
    ANNULE: { icon: XCircle, color: "text-red-400" },
    EXPIRE: { icon: Clock, color: "text-amber-400" },
};

export default function SuperAdminAbonnements({ abonnements, users, promotions }: { abonnements: any[]; users: any[]; promotions: any[] }) {
    const [list, setList] = useState(abonnements);
    const [isPending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    const [newAb, setNewAb] = useState<{
        userId: string;
        plan: string;
        statut: "ACTIF" | "ANNULE" | "EXPIRE";
        reductionType: string | null;
        reductionValeur: number | null;
        notesPromo: string;
    }>({
        userId: "",
        plan: "PRO",
        statut: "ACTIF",
        reductionType: null,
        reductionValeur: null,
        notesPromo: ""
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleStatusChange = (id: string, field: string, value: any) => {
        startTransition(async () => {
            try {
                await updateAbonnement(id, { [field]: value } as any);
                setList((prev) => prev.map((a) => a.id === id ? { ...a, [field]: value } : a));
                toast.success("Abonnement mis à jour");
                setEditingId(null);
            } catch {
                toast.error("Erreur de mise à jour");
            }
        });
    };

    const handleCreate = async () => {
        if (!newAb.userId) { toast.error("Sélectionnez un utilisateur"); return; }
        startTransition(async () => {
            try {
                const user = users.find(u => u.id === newAb.userId);
                const created = await createAbonnement(newAb as any);
                setList((prev) => [{ ...created, user }, ...prev]);
                toast.success("Abonnement créé");
                setCreating(false);
                setNewAb({ userId: "", plan: "PRO", statut: "ACTIF", reductionType: null, reductionValeur: null, notesPromo: "" });
            } catch {
                toast.error("Erreur de création");
            }
        });
    };

    const calculatePrice = (ab: any) => {
        const basePrices: Record<string, number> = { SOLO: 25000, PRO: 50000, CLINIQUE: 95000 };
        let price = basePrices[ab.plan] || 0;

        if (ab.reductionType === "POURCENTAGE" && ab.reductionValeur) {
            price = price * (1 - ab.reductionValeur / 100);
        } else if (ab.reductionType === "MONTANT_FIXE" && ab.reductionValeur) {
            price = Math.max(0, price - ab.reductionValeur);
        }
        return price;
    };

    const totalMRR = list.filter(a => a.statut === "ACTIF").reduce((sum, a) => {
        return sum + calculatePrice(a);
    }, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Abonnements & CRM</h1>
                    <p className="text-slate-400 text-sm mt-1">{list.filter(a => a.statut === "ACTIF").length} abonnement(s) actif(s)</p>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                >
                    <PlusCircle className="h-4 w-4" />
                    Nouvel abonnement / Promo
                </button>
            </div>

            {/* MRR Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-violet-500/20 to-pink-500/10 border border-violet-500/20 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">MRR Net (Réductions incluses)</p>
                    <p className="text-2xl font-bold text-white">{totalMRR.toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Abonnements Actifs</p>
                    <p className="text-2xl font-bold text-white">{list.filter(a => a.statut === "ACTIF").length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Taux de rétention</p>
                    <p className="text-2xl font-bold text-white">98.5%</p>
                </div>
            </div>

            {/* New subscription form */}
            {creating && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                    <h3 className="font-semibold text-white text-sm border-b border-white/5 pb-3">Configurer un nouvel abonnement</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Utilisateur / Cabinet</label>
                            <select
                                value={newAb.userId}
                                onChange={(e) => setNewAb((p) => ({ ...p, userId: e.target.value }))}
                                className="w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            >
                                <option value="">Sélectionner un client...</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Plan Initial</label>
                            <select
                                value={newAb.plan}
                                onChange={(e) => setNewAb((p) => ({ ...p, plan: e.target.value as any }))}
                                className="w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            >
                                {["SOLO", "PRO", "CLINIQUE"].map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Type de réduction</label>
                            <select
                                value={newAb.reductionType || ""}
                                onChange={(e) => setNewAb((p) => ({ ...p, reductionType: e.target.value || null }))}
                                className="w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            >
                                <option value="">Aucune</option>
                                <option value="POURCENTAGE">Pourcentage (%)</option>
                                <option value="MONTANT_FIXE">Montant Fixe (FCFA)</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Valeur réduction</label>
                            <input
                                type="number"
                                value={newAb.reductionValeur || 0}
                                onChange={(e) => setNewAb((p) => ({ ...p, reductionValeur: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                placeholder="0"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 block mb-1.5">Note Interne / Justification Promo</label>
                            <input
                                type="text"
                                value={newAb.notesPromo}
                                onChange={(e) => setNewAb((p) => ({ ...p, notesPromo: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                placeholder="Ex: Geste commercial inauguration clinique..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleCreate}
                            disabled={isPending}
                            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-all"
                        >
                            {isPending ? "Configuration en cours..." : "Valider l'abonnement"}
                        </button>
                        <button
                            onClick={() => setCreating(false)}
                            className="text-slate-400 hover:text-white text-sm px-4 py-2 transition-colors font-medium"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/3">
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client / Clinique</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réduction</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prix Final</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {list.length > 0 ? list.map((ab) => (
                                <tr key={ab.id} className="hover:bg-white/3 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white">{ab.user?.name || "Client Inconnu"}</span>
                                            <span className="text-[10px] text-slate-500">{ab.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3 w-3 text-violet-400" />
                                            <span className="text-xs font-medium text-slate-300">{ab.plan}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {ab.reductionType ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-pink-400 font-bold">
                                                    -{ab.reductionValeur}{ab.reductionType === "POURCENTAGE" ? "%" : " FCFA"}
                                                </span>
                                                {ab.notesPromo && <span className="text-[10px] text-slate-500 italic truncate max-w-[120px]">{ab.notesPromo}</span>}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-600">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-white">
                                            {calculatePrice(ab).toLocaleString("fr-FR")} <span className="text-[10px] text-slate-500">FCFA/mois</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {(STATUT_CONFIG as any)[ab.statut] && (
                                                <>
                                                    <span className={`h-1.5 w-1.5 rounded-full bg-current ${(STATUT_CONFIG as any)[ab.statut].color}`}></span>
                                                    <span className={`text-[10px] font-bold uppercase ${(STATUT_CONFIG as any)[ab.statut].color}`}>
                                                        {ab.statut}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={ab.statut}
                                                onChange={(e) => handleStatusChange(ab.id, "statut", e.target.value)}
                                                className="bg-[#1a2340] border border-white/10 rounded px-2 py-1 text-[10px] text-slate-400 focus:outline-none focus:border-violet-500/50"
                                            >
                                                {Object.keys(STATUT_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        Aucun abonnement enregistré
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
