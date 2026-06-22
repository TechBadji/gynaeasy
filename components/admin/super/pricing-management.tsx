"use client";

import { useState, useTransition, useEffect } from "react";
import { updatePlanConfig, getPlanStats } from "@/app/actions/superadmin";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import {
    Save, CheckCircle2, AlertCircle, Plus, Trash2,
    Users, TrendingUp, Loader2, Check
} from "lucide-react";
import toast from "react-hot-toast";

const PLAN_META: Record<string, { icon: string; color: string; accent: string; border: string }> = {
    SOLO:    { icon: "🌱", color: "text-slate-300",  accent: "bg-slate-500/5",  border: "border-slate-500/20" },
    PRO:     { icon: "🚀", color: "text-violet-400", accent: "bg-violet-500/5", border: "border-violet-500/30" },
    CLINIQUE:{ icon: "👑", color: "text-amber-400",  accent: "bg-amber-500/5",  border: "border-amber-500/30" },
};

const DEFAULT_FEATURES: Record<string, { text: string; included: boolean }[]> = {
    SOLO:     SUBSCRIPTION_PLANS[0].features,
    PRO:      SUBSCRIPTION_PLANS[1].features,
    CLINIQUE: SUBSCRIPTION_PLANS[2].features,
};

const DEFAULT_PRICES: Record<string, number> = { SOLO: 25000, PRO: 50000, CLINIQUE: 95000 };

type Feature = { text: string; included: boolean };
type PlanEdit = {
    prixMensuel: number;
    prixAnnuel: number | null;
    description: string;
    features: Feature[];
    isPromotional: boolean;
};

export default function SuperAdminPricing({ planConfigs }: { planConfigs: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [stats, setStats] = useState<{ plan: string; activeSubscribers: number; monthlyRevenue: number }[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [savedPlan, setSavedPlan] = useState<string | null>(null);

    const initEdits = (): Record<string, PlanEdit> => {
        const result: Record<string, PlanEdit> = {};
        for (const planName of ["SOLO", "PRO", "CLINIQUE"]) {
            const cfg = planConfigs.find(c => c.plan === planName);
            const dbFeatures = cfg?.features && Array.isArray(cfg.features) && cfg.features.length > 0;
            result[planName] = {
                prixMensuel:   cfg?.prixMensuel   ?? DEFAULT_PRICES[planName],
                prixAnnuel:    cfg?.prixAnnuel    ?? null,
                description:   cfg?.description   ?? "",
                features:      dbFeatures ? cfg.features : DEFAULT_FEATURES[planName],
                isPromotional: cfg?.isPromotional ?? false,
            };
        }
        return result;
    };

    const [edits, setEdits] = useState<Record<string, PlanEdit>>(initEdits);

    useEffect(() => {
        getPlanStats()
            .then(setStats)
            .catch(() => {})
            .finally(() => setLoadingStats(false));
    }, []);

    const updateEdit = (plan: string, field: keyof PlanEdit, value: any) => {
        setEdits(prev => ({ ...prev, [plan]: { ...prev[plan], [field]: value } }));
        setSavedPlan(null);
    };

    const updateFeature = (plan: string, idx: number, field: keyof Feature, value: any) => {
        const features = edits[plan].features.map((f, i) => i === idx ? { ...f, [field]: value } : f);
        updateEdit(plan, "features", features);
    };

    const addFeature = (plan: string) => {
        updateEdit(plan, "features", [...edits[plan].features, { text: "", included: true }]);
    };

    const removeFeature = (plan: string, idx: number) => {
        updateEdit(plan, "features", edits[plan].features.filter((_, i) => i !== idx));
    };

    const handleSave = (plan: string) => {
        startTransition(async () => {
            try {
                const e = edits[plan];
                await updatePlanConfig(plan as any, {
                    prixMensuel:   e.prixMensuel,
                    prixAnnuel:    e.prixAnnuel,
                    description:   e.description,
                    features:      e.features.filter(f => f.text.trim() !== ""),
                    isPromotional: e.isPromotional,
                });
                setSavedPlan(plan);
                toast.success(`Plan ${plan} sauvegardé`);
                setTimeout(() => setSavedPlan(null), 3000);
            } catch {
                toast.error("Erreur de sauvegarde");
            }
        });
    };

    const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Gestion des Tarifs & Plans</h1>
                <p className="text-slate-400 text-sm mt-1">Configurez les prix, fonctionnalités et suivez les performances de chaque offre</p>
            </div>

            {/* Stats par plan */}
            <div className="grid grid-cols-3 gap-4">
                {(["SOLO", "PRO", "CLINIQUE"] as const).map(planName => {
                    const stat = stats.find(s => s.plan === planName);
                    const meta = PLAN_META[planName];
                    return (
                        <div key={planName} className={`rounded-xl border p-5 ${meta.accent} ${meta.border}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">{meta.icon}</span>
                                <span className={`text-sm font-bold ${meta.color}`}>{planName}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                                        <Users className="h-3 w-3" /> Abonnés
                                    </p>
                                    <p className="text-2xl font-black text-white">
                                        {loadingStats ? <Loader2 className="h-4 w-4 animate-spin inline" /> : (stat?.activeSubscribers ?? 0)}
                                    </p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                                        <TrendingUp className="h-3 w-3" /> CA/mois
                                    </p>
                                    <p className="text-sm font-black text-white">
                                        {loadingStats ? "..." : `${fmt(stat?.monthlyRevenue ?? 0)}`}
                                        <span className="text-[10px] text-slate-500 ml-0.5">FCFA</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cartes d'édition par plan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(["SOLO", "PRO", "CLINIQUE"] as const).map(planName => {
                    const edit = edits[planName];
                    const meta = PLAN_META[planName];
                    const isSaved = savedPlan === planName;
                    const annualDiscount = edit.prixAnnuel && edit.prixMensuel > 0
                        ? Math.round((1 - edit.prixAnnuel / (edit.prixMensuel * 12)) * 100)
                        : 0;

                    return (
                        <div key={planName} className="bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden">
                            {/* En-tête */}
                            <div className={`p-5 border-b border-white/5 flex items-center justify-between ${meta.accent}`}>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{meta.icon}</span>
                                    <div>
                                        <h3 className={`font-bold text-base ${meta.color}`}>{planName}</h3>
                                        {edit.isPromotional && (
                                            <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">Promo active</span>
                                        )}
                                    </div>
                                </div>
                                {/* Toggle promo */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500">Promo</span>
                                    <button
                                        onClick={() => updateEdit(planName, "isPromotional", !edit.isPromotional)}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${edit.isPromotional ? "bg-pink-600" : "bg-slate-700"}`}
                                    >
                                        <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${edit.isPromotional ? "translate-x-5" : "translate-x-1"}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex-1 space-y-5 overflow-y-auto" style={{ maxHeight: "560px" }}>
                                {/* Prix mensuel + annuel */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                                            Prix Mensuel
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={0}
                                                value={edit.prixMensuel}
                                                onChange={e => updateEdit(planName, "prixMensuel", parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-14 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold">FCFA</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                                            Prix Annuel <span className="text-pink-400 normal-case font-normal">(opt.)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={0}
                                                value={edit.prixAnnuel ?? ""}
                                                onChange={e => updateEdit(planName, "prixAnnuel", e.target.value ? parseFloat(e.target.value) : null)}
                                                placeholder={String(Math.round(edit.prixMensuel * 10))}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-14 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-bold">FCFA</span>
                                        </div>
                                        {annualDiscount > 0 && (
                                            <p className="text-[10px] text-emerald-400 mt-1 font-bold">
                                                → {annualDiscount}% de réduction
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        value={edit.description}
                                        onChange={e => updateEdit(planName, "description", e.target.value)}
                                        placeholder="Ex : Idéal pour les petits cabinets…"
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
                                    />
                                </div>

                                {/* Fonctionnalités éditables */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                            Fonctionnalités ({edit.features.filter(f => f.included).length} incluses)
                                        </label>
                                        <button
                                            onClick={() => addFeature(planName)}
                                            className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-white transition-colors font-semibold"
                                        >
                                            <Plus className="h-3 w-3" /> Ajouter
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {edit.features.map((f, idx) => (
                                            <div key={idx} className="flex items-center gap-2 group">
                                                {/* Toggle inclus/exclu */}
                                                <button
                                                    onClick={() => updateFeature(planName, idx, "included", !f.included)}
                                                    title={f.included ? "Marquer comme exclu" : "Marquer comme inclus"}
                                                    className={`h-4 w-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${f.included ? "bg-emerald-500 border-emerald-500" : "bg-transparent border-slate-600 hover:border-slate-400"}`}
                                                >
                                                    {f.included && <Check className="h-2.5 w-2.5 text-white" />}
                                                </button>
                                                {/* Texte éditable */}
                                                <input
                                                    type="text"
                                                    value={f.text}
                                                    onChange={e => updateFeature(planName, idx, "text", e.target.value)}
                                                    placeholder="Nom de la fonctionnalité…"
                                                    className={`flex-1 bg-transparent border-b py-0.5 text-xs focus:outline-none transition-colors ${f.included ? "text-slate-300 border-white/10 focus:border-violet-500/50" : "text-slate-600 border-white/5 focus:border-white/20 line-through"}`}
                                                />
                                                <button
                                                    onClick={() => removeFeature(planName, idx)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500/60 hover:text-red-400 transition-all flex-shrink-0"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {edit.features.length === 0 && (
                                            <p className="text-xs text-slate-600 italic text-center py-2">
                                                Aucune fonctionnalité — cliquez &quot;Ajouter&quot;
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer : récap + bouton save */}
                            <div className="px-5 py-4 bg-white/3 border-t border-white/5 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] text-slate-500 truncate">
                                        {fmt(edit.prixMensuel)} FCFA/mois
                                        {edit.prixAnnuel ? ` · ${fmt(edit.prixAnnuel)} FCFA/an` : ""}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleSave(planName)}
                                    disabled={isPending}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-all ${isSaved ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"}`}
                                >
                                    {isPending && savedPlan !== planName ? null : null}
                                    {isSaved
                                        ? <><CheckCircle2 className="h-3.5 w-3.5" /> Sauvegardé !</>
                                        : isPending
                                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sauvegarde…</>
                                            : <><Save className="h-3.5 w-3.5" /> Sauvegarder</>
                                    }
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Avertissement */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-amber-400">Impact des changements de prix</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        Les prix et fonctionnalités mis à jour s'affichent immédiatement sur la page tarifs visible par les médecins.
                        Les abonnements déjà actifs conservent leur tarif historique — modifiez-les manuellement dans l'onglet <strong className="text-slate-300">Abonnements</strong> si besoin.
                    </p>
                </div>
            </div>
        </div>
    );
}
