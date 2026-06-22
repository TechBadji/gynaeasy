"use client";

import { useState, useTransition, useMemo } from "react";
import { createPromotion, updatePromotion, deletePromotion } from "@/app/actions/superadmin";
import {
    Tag, Plus, Trash2, Calendar, Check, X, AlertCircle,
    Copy, CheckCheck, Search, Pencil, BarChart3, Clock, Infinity
} from "lucide-react";
import toast from "react-hot-toast";

const PLANS = ["SOLO", "PRO", "CLINIQUE"] as const;

const PLAN_COLORS: Record<string, string> = {
    SOLO:     "bg-slate-500/20 text-slate-300 border-slate-500/30",
    PRO:      "bg-violet-500/20 text-violet-300 border-violet-500/30",
    CLINIQUE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

type Promo = {
    id: string;
    code: string;
    description: string | null;
    type: "POURCENTAGE" | "MONTANT_FIXE";
    valeur: number;
    validUntil: string | null;
    usageLimit: number | null;
    usageCount: number;
    usagePerUser: number | null;
    applicableTo: string[];
    active: boolean;
    createdAt: string;
};

const emptyForm = () => ({
    code: "",
    description: "",
    type: "POURCENTAGE" as "POURCENTAGE" | "MONTANT_FIXE",
    valeur: 20,
    usageLimit: "" as string | number,
    usagePerUser: "" as string | number,
    validUntil: "",
    applicableTo: [] as string[],
});

function isExpired(p: Promo) {
    return !!p.validUntil && new Date(p.validUntil) < new Date();
}

function isExhausted(p: Promo) {
    return !!p.usageLimit && p.usageCount >= p.usageLimit;
}

function PromoStatusBadge({ promo }: { promo: Promo }) {
    if (isExpired(promo))
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/30">EXPIRÉ</span>;
    if (isExhausted(promo))
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/30">ÉPUISÉ</span>;
    if (!promo.active)
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-500/10 text-slate-400 border-slate-500/30">INACTIF</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">ACTIF</span>;
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="text-slate-500 hover:text-slate-200 transition-colors"
            title="Copier le code"
        >
            {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

function PlanChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const toggle = (p: string) => onChange(value.includes(p) ? value.filter(x => x !== p) : [...value, p]);
    return (
        <div className="flex gap-2 flex-wrap">
            {PLANS.map(p => (
                <button
                    key={p}
                    type="button"
                    onClick={() => toggle(p)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${value.includes(p) ? PLAN_COLORS[p] : "bg-white/3 text-slate-600 border-white/5 hover:border-white/20"}`}
                >
                    {p}
                </button>
            ))}
            {value.length > 0 && (
                <button type="button" onClick={() => onChange([])} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
                    Tous les plans
                </button>
            )}
        </div>
    );
}

function PromoForm({
    initial,
    onSubmit,
    onCancel,
    isPending,
    submitLabel,
    readonlyCode = false,
}: {
    initial: ReturnType<typeof emptyForm>;
    onSubmit: (data: ReturnType<typeof emptyForm>) => void;
    onCancel: () => void;
    isPending: boolean;
    submitLabel: string;
    readonlyCode?: boolean;
}) {
    const [form, setForm] = useState(initial);
    const set = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Code *</label>
                    <input
                        type="text"
                        value={form.code}
                        readOnly={readonlyCode}
                        onChange={e => set("code", e.target.value.toUpperCase())}
                        placeholder="GYNAEASY20"
                        className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-violet-500/50 transition-colors uppercase ${readonlyCode ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Description</label>
                    <input
                        type="text"
                        value={form.description}
                        onChange={e => set("description", e.target.value)}
                        placeholder="Lancement 2026 — -20% pour les médecins…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Type de réduction</label>
                    <select
                        value={form.type}
                        onChange={e => set("type", e.target.value)}
                        className="w-full bg-[#131b2e] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                        <option value="POURCENTAGE">Pourcentage (%)</option>
                        <option value="MONTANT_FIXE">Montant Fixe (FCFA)</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                        Valeur {form.type === "POURCENTAGE" ? "(%)" : "(FCFA)"}
                    </label>
                    <input
                        type="number"
                        min={0}
                        max={form.type === "POURCENTAGE" ? 100 : undefined}
                        value={form.valeur}
                        onChange={e => set("valeur", parseFloat(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                        Validité jusqu&apos;au <span className="text-slate-600 normal-case font-normal">(vide = illimité)</span>
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                        <input
                            type="date"
                            value={form.validUntil}
                            onChange={e => set("validUntil", e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                        Limite globale <span className="text-slate-600 normal-case font-normal">(vide = ∞)</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={form.usageLimit}
                        onChange={e => set("usageLimit", e.target.value)}
                        placeholder="100"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                        Max par médecin <span className="text-slate-600 normal-case font-normal">(vide = ∞)</span>
                    </label>
                    <input
                        type="number"
                        min={1}
                        value={form.usagePerUser}
                        onChange={e => set("usagePerUser", e.target.value)}
                        placeholder="1"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                        Plans applicables <span className="text-slate-600 normal-case font-normal">(vide = tous)</span>
                    </label>
                    <PlanChips value={form.applicableTo} onChange={v => set("applicableTo", v)} />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                    Annuler
                </button>
                <button
                    onClick={() => onSubmit(form)}
                    disabled={isPending || !form.code}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                    {isPending ? "En cours…" : submitLabel}
                </button>
            </div>
        </div>
    );
}

export default function SuperAdminPromotions({ promotions }: { promotions: any[] }) {
    const [list, setList] = useState<Promo[]>(promotions);
    const [isPending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "active" | "inactive" | "expired">("all");

    const filtered = useMemo(() => {
        return list
            .filter(p => p.code.includes(search.toUpperCase()) || (p.description ?? "").toLowerCase().includes(search.toLowerCase()))
            .filter(p => {
                if (filter === "active") return p.active && !isExpired(p) && !isExhausted(p);
                if (filter === "inactive") return !p.active;
                if (filter === "expired") return isExpired(p) || isExhausted(p);
                return true;
            });
    }, [list, search, filter]);

    const stats = useMemo(() => ({
        total: list.length,
        active: list.filter(p => p.active && !isExpired(p) && !isExhausted(p)).length,
        totalUses: list.reduce((a, p) => a + p.usageCount, 0),
    }), [list]);

    const handleCreate = (form: ReturnType<typeof emptyForm>) => {
        if (!form.code) return toast.error("Le code est requis");
        startTransition(async () => {
            try {
                const promo = await createPromotion({
                    code: form.code,
                    description: form.description || undefined,
                    type: form.type,
                    valeur: form.valeur,
                    validUntil: form.validUntil ? new Date(form.validUntil) : null,
                    usageLimit: form.usageLimit ? parseInt(String(form.usageLimit)) : null,
                    usagePerUser: form.usagePerUser ? parseInt(String(form.usagePerUser)) : null,
                    applicableTo: form.applicableTo,
                });
                setList(prev => [promo, ...prev]);
                setCreating(false);
                toast.success(`Code "${promo.code}" créé`);
            } catch (err: any) {
                toast.error(err?.message?.includes("Unique") ? "Ce code existe déjà" : "Erreur de création");
            }
        });
    };

    const handleEdit = (promo: Promo, form: ReturnType<typeof emptyForm>) => {
        startTransition(async () => {
            try {
                const updated = await updatePromotion(promo.id, {
                    description: form.description || undefined,
                    valeur: form.valeur,
                    validUntil: form.validUntil ? new Date(form.validUntil) : null,
                    usageLimit: form.usageLimit ? parseInt(String(form.usageLimit)) : null,
                    usagePerUser: form.usagePerUser ? parseInt(String(form.usagePerUser)) : null,
                    applicableTo: form.applicableTo,
                });
                setList(prev => prev.map(p => p.id === promo.id ? { ...p, ...updated } : p));
                setEditingId(null);
                toast.success("Code mis à jour");
            } catch {
                toast.error("Erreur de modification");
            }
        });
    };

    const handleToggle = (promo: Promo) => {
        startTransition(async () => {
            try {
                await updatePromotion(promo.id, { active: !promo.active });
                setList(prev => prev.map(p => p.id === promo.id ? { ...p, active: !p.active } : p));
                toast.success(promo.active ? "Code désactivé" : "Code activé");
            } catch {
                toast.error("Erreur");
            }
        });
    };

    const handleDelete = (id: string, code: string) => {
        if (!confirm(`Supprimer définitivement le code "${code}" ?`)) return;
        startTransition(async () => {
            try {
                await deletePromotion(id);
                setList(prev => prev.filter(p => p.id !== id));
                toast.success("Code supprimé");
            } catch {
                toast.error("Erreur de suppression");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Codes Promotionnels</h1>
                    <p className="text-slate-400 text-sm mt-1">Gérez les réductions applicables lors de la souscription d&apos;un abonnement</p>
                </div>
                <button
                    onClick={() => { setCreating(true); setEditingId(null); }}
                    className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> Nouveau Code
                </button>
            </div>

            {/* Stats résumées */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total codes", value: stats.total, icon: Tag, color: "text-violet-400" },
                    { label: "Codes actifs", value: stats.active, icon: Check, color: "text-emerald-400" },
                    { label: "Utilisations totales", value: stats.totalUses, icon: BarChart3, color: "text-pink-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{value}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Formulaire de création */}
            {creating && (
                <PromoForm
                    initial={emptyForm()}
                    onSubmit={handleCreate}
                    onCancel={() => setCreating(false)}
                    isPending={isPending}
                    submitLabel="Créer le Code"
                />
            )}

            {/* Barre de recherche + filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un code ou une description…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                    {(["all", "active", "inactive", "expired"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${filter === f ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            {f === "all" ? "Tous" : f === "active" ? "Actifs" : f === "inactive" ? "Inactifs" : "Expirés"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/3 border-b border-white/5">
                        <tr>
                            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Réduction</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plans</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validité</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilisations</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                            <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.length > 0 ? filtered.map((promo) => (
                            <>
                                <tr key={promo.id} className={`hover:bg-white/3 transition-colors ${(isExpired(promo) || isExhausted(promo) || !promo.active) ? "opacity-60" : ""}`}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                                            <span className="font-black text-white font-mono tracking-wide">{promo.code}</span>
                                            <CopyButton text={promo.code} />
                                        </div>
                                        {promo.description && (
                                            <p className="text-[10px] text-slate-500 mt-0.5 pl-5">{promo.description}</p>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-bold text-white">
                                            {promo.type === "POURCENTAGE" ? `-${promo.valeur}%` : `-${promo.valeur.toLocaleString()} FCFA`}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {promo.applicableTo.length > 0 ? (
                                            <div className="flex gap-1 flex-wrap">
                                                {promo.applicableTo.map(p => (
                                                    <span key={p} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${PLAN_COLORS[p] ?? "bg-white/5 text-slate-400 border-white/10"}`}>
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-600 italic">Tous</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {promo.validUntil ? (
                                            <div className={`flex items-center gap-1.5 text-xs ${isExpired(promo) ? "text-orange-400" : "text-slate-400"}`}>
                                                {isExpired(promo) ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                                {new Date(promo.validUntil).toLocaleDateString("fr-FR")}
                                            </div>
                                        ) : (
                                            <Infinity className="h-3.5 w-3.5 text-slate-600" />
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {promo.usageLimit ? (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-20 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${isExhausted(promo) ? "bg-red-500" : "bg-violet-500"}`}
                                                            style={{ width: `${Math.min((promo.usageCount / promo.usageLimit) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {promo.usageCount}/{promo.usageLimit}
                                                    </span>
                                                </div>
                                                {promo.usagePerUser && (
                                                    <p className="text-[9px] text-slate-600">max {promo.usagePerUser}/médecin</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                                {promo.usageCount} / <Infinity className="h-2.5 w-2.5" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <PromoStatusBadge promo={promo} />
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingId(editingId === promo.id ? null : promo.id)}
                                                className="text-slate-500 hover:text-violet-400 transition-colors"
                                                title="Modifier"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleToggle(promo)}
                                                className={`transition-colors ${promo.active ? "text-slate-500 hover:text-amber-400" : "text-slate-500 hover:text-emerald-400"}`}
                                                title={promo.active ? "Désactiver" : "Activer"}
                                            >
                                                {promo.active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id, promo.code)}
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Formulaire d'édition inline */}
                                {editingId === promo.id && (
                                    <tr key={`${promo.id}-edit`}>
                                        <td colSpan={7} className="px-5 py-3 bg-white/3 border-b border-white/5">
                                            <PromoForm
                                                readonlyCode
                                                initial={{
                                                    code: promo.code,
                                                    description: promo.description ?? "",
                                                    type: promo.type,
                                                    valeur: promo.valeur,
                                                    usageLimit: promo.usageLimit ?? "",
                                                    usagePerUser: promo.usagePerUser ?? "",
                                                    validUntil: promo.validUntil ? promo.validUntil.slice(0, 10) : "",
                                                    applicableTo: promo.applicableTo,
                                                }}
                                                onSubmit={(form) => handleEdit(promo, form)}
                                                onCancel={() => setEditingId(null)}
                                                isPending={isPending}
                                                submitLabel="Enregistrer"
                                            />
                                        </td>
                                    </tr>
                                )}
                            </>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">
                                    {search || filter !== "all" ? "Aucun code ne correspond à votre recherche" : "Aucun code promotionnel enregistré"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Note d'utilisation */}
            <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-violet-300">Comment fonctionnent les codes ?</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Les médecins saisissent leur code promo sur la page <strong className="text-slate-300">Abonnement</strong> avant de choisir un plan.
                        La réduction est calculée automatiquement, l&apos;utilisation est enregistrée et les limites sont vérifiées en temps réel.
                    </p>
                </div>
            </div>
        </div>
    );
}
