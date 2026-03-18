"use client";

import { useState, useTransition } from "react";
import { updatePlanConfig } from "@/app/actions/superadmin";
import { Settings, Save, CheckCircle2, AlertCircle, Info } from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminPricing({ planConfigs }: { planConfigs: any[] }) {
    const [configs, setConfigs] = useState(planConfigs);
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (plan: string, data: any) => {
        startTransition(async () => {
            try {
                const updated = await updatePlanConfig(plan as any, data);
                setConfigs(prev => prev.map(c => c.plan === plan ? updated : c));
                toast.success(`Plan ${plan} mis à jour`);
            } catch (err) {
                toast.error("Erreur de mise à jour");
            }
        });
    };

    const PLAN_DETAILS = {
        SOLO: { icon: "🌱", color: "text-slate-400" },
        PRO: { icon: "🚀", color: "text-violet-400" },
        CLINIQUE: { icon: "👑", color: "text-amber-400" },
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Gestion des Tarifs & Plans</h1>
                <p className="text-slate-400 text-sm mt-1">Configurez les prix mensuels et les fonctionnalités pour chaque abonnement</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {["SOLO", "PRO", "CLINIQUE"].map((planName) => {
                    const config = configs.find(c => c.plan === planName) || {
                        plan: planName,
                        prixMensuel: planName === "SOLO" ? 25000 : planName === "PRO" ? 50000 : 95000,
                        description: "",
                        features: []
                    };
                    const details = (PLAN_DETAILS as any)[planName];

                    return (
                        <div key={planName} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-white/5 bg-white/3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{details.icon}</span>
                                    <div>
                                        <h3 className={`font-bold ${details.color}`}>{planName}</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Standard</p>
                                    </div>
                                </div>
                                {config.isPromotional && (
                                    <span className="bg-pink-500/20 text-pink-400 text-[10px] font-bold px-2 py-1 rounded-full border border-pink-500/30">PROMO</span>
                                )}
                            </div>

                            <div className="p-6 flex-1 space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Prix Mensuel (FCFA)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            defaultValue={config.prixMensuel}
                                            onBlur={(e) => handleUpdate(planName, { ...config, prixMensuel: parseFloat(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-4 pr-12 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-bold">FCFA</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Description</label>
                                    <textarea
                                        defaultValue={config.description || ""}
                                        onBlur={(e) => handleUpdate(planName, { ...config, description: e.target.value })}
                                        placeholder="Ex: Idéal pour les petits cabinets..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 min-h-[80px] resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1.5 font-medium flex items-center gap-1">
                                        Fonctionnalités incluses
                                        <Info className="h-3 w-3 text-slate-600" />
                                    </label>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                        {/* Mock features for now - could be dynamic */}
                                        {["Agenda complet", "Dossier patient HDS", "Historique médical", "Facturation CCAM", "Support Prioritaire", "Accès Multi-postes"].map((f) => (
                                            <div key={f} className="flex items-center gap-2 group">
                                                <div className="h-4 w-4 rounded border border-white/20 flex items-center justify-center bg-white/5 group-hover:border-violet-500/50 transition-colors">
                                                    <div className="h-2 w-2 rounded-full bg-violet-500 opacity-50"></div>
                                                </div>
                                                <span className="text-xs text-slate-400 cursor-default">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`promo-${planName}`}
                                        defaultChecked={config.isPromotional}
                                        onChange={(e) => handleUpdate(planName, { ...config, isPromotional: e.target.checked })}
                                        className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                                    />
                                    <label htmlFor={`promo-${planName}`} className="text-xs text-slate-400 cursor-pointer">Marquer comme promotionnel</label>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-white/3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-slate-500">Mise à jour : {new Date(config.updatedAt || Date.now()).toLocaleDateString()}</span>
                                <button className="text-xs text-violet-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium">
                                    <Save className="h-3.5 w-3.5" /> Enregistrer
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Warning box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-amber-400">Attention sur les changements de prix</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Les changements de prix s&apos;appliqueront uniquement aux nouveaux abonnements.
                        Les abonnements existants conserveront leur tarif actuel sauf si vous les mettez à jour manuellement dans l&apos;onglet Abonnements.
                    </p>
                </div>
            </div>
        </div>
    );
}
