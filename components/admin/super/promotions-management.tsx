"use client";

import { useState, useTransition } from "react";
import { createPromotion, updatePromotion, deletePromotion } from "@/app/actions/superadmin";
import { Tag, Plus, Trash2, Calendar, Check, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminPromotions({ promotions }: { promotions: any[] }) {
    const [list, setList] = useState(promotions);
    const [isPending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    const [newPromo, setNewPromo] = useState({
        code: "",
        type: "POURCENTAGE" as const,
        valeur: 10,
        usageLimit: 100,
        validUntil: ""
    });

    const handleCreate = () => {
        if (!newPromo.code) return toast.error("Le code est requis");
        startTransition(async () => {
            try {
                const promo = await createPromotion({
                    ...newPromo,
                    validUntil: newPromo.validUntil ? new Date(newPromo.validUntil) : null,
                    usageLimit: newPromo.usageLimit ? parseInt(newPromo.usageLimit as any) : null
                });
                setList(prev => [promo, ...prev]);
                setCreating(false);
                setNewPromo({ code: "", type: "POURCENTAGE", valeur: 10, usageLimit: 100, validUntil: "" });
                toast.success("Code promo créé");
            } catch (err) {
                toast.error("Erreur de création");
            }
        });
    };

    const handleToggle = (id: string, active: boolean) => {
        startTransition(async () => {
            try {
                await updatePromotion(id, !active);
                setList(prev => prev.map(p => p.id === id ? { ...p, active: !active } : p));
                toast.success(active ? "Code désactivé" : "Code activé");
            } catch (err) {
                toast.error("Erreur");
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Supprimer ce code promo ?")) return;
        startTransition(async () => {
            try {
                await deletePromotion(id);
                setList(prev => prev.filter(p => p.id !== id));
                toast.success("Code supprimé");
            } catch (err) {
                toast.error("Erreur");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Codes Promotionnels</h1>
                    <p className="text-slate-400 text-sm mt-1">Gérez les réductions applicables lors de la création d&apos;abonnements</p>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Nouveau Code
                </button>
            </div>

            {creating && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-white text-sm">Nouveau Code Promo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 block mb-1">Code (Majuscules recommandé)</label>
                            <input
                                type="text"
                                value={newPromo.code}
                                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                                placeholder="PROMO2026"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Type</label>
                            <select
                                value={newPromo.type}
                                onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as any })}
                                className="w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            >
                                <option value="POURCENTAGE">Pourcentage (%)</option>
                                <option value="MONTANT_FIXE">Montant Fixe (FCFA)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Valeur</label>
                            <input
                                type="number"
                                value={newPromo.valeur}
                                onChange={(e) => setNewPromo({ ...newPromo, valeur: parseFloat(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Validité jusqu&apos;au</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                <input
                                    type="date"
                                    value={newPromo.validUntil}
                                    onChange={(e) => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1">Limite d&apos;utilisation</label>
                            <input
                                type="number"
                                value={newPromo.usageLimit}
                                onChange={(e) => setNewPromo({ ...newPromo, usageLimit: parseInt(e.target.value) })}
                                placeholder="100"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4">
                        <button
                            onClick={() => setCreating(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isPending}
                            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-6 py-2 rounded-lg transition-all"
                        >
                            {isPending ? "Création..." : "Ajouter le Code"}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/3 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réduction</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validité</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilisations</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {list.length > 0 ? list.map((promo) => (
                            <tr key={promo.id} className="hover:bg-white/3 transition-colors border-b border-white/5 last:border-0">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-3.5 w-3.5 text-pink-400" />
                                        <span className="font-bold text-white tracking-wide">{promo.code}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white font-medium">
                                    {promo.type === "POURCENTAGE" ? `${promo.valeur}%` : `${promo.valeur.toLocaleString()} FCFA`}
                                </td>
                                <td className="px-6 py-4 text-slate-400 text-xs">
                                    {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString() : <span className="text-slate-600">Illimité</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-violet-500 rounded-full"
                                                style={{ width: promo.usageLimit ? `${(promo.usageCount / promo.usageLimit) * 100}%` : "5%" }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {promo.usageCount}/{promo.usageLimit || "∞"}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${promo.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}>
                                        {promo.active ? "ACTIF" : "INACTIF"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => handleToggle(promo.id, promo.active)}
                                            className="text-slate-400 hover:text-white transition-colors"
                                            title={promo.active ? "Désactiver" : "Activer"}
                                        >
                                            {promo.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promo.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                    Aucun code promotionnel enregistré
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4 flex gap-4">
                <AlertCircle className="h-5 w-5 text-violet-400 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-violet-300">Notes d&apos;utilisation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Ces codes peuvent être saisis manuellement lors de la configuration de l&apos;abonnement d&apos;un médecin ou clinique dans l&apos;interface admin.
                        La réduction sera calculée automatiquement lors de la facturation client.
                    </p>
                </div>
            </div>
        </div>
    );
}
