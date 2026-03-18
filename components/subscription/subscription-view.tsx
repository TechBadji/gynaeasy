"use client";

import { CheckCircle2, Shield, Clock, AlertCircle, Info, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    ACTIF: { label: "Actif", color: "text-emerald-600", bg: "bg-emerald-50" },
    EXPIRE: { label: "Expiré", color: "text-amber-600", bg: "bg-amber-50" },
    ANNULE: { label: "Annué", color: "text-red-600", bg: "bg-red-50" },
};

const PLAN_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    BASIQUE: { label: "Gynaeasy Basique", color: "text-slate-600", bg: "bg-slate-50", icon: Shield },
    PRO: { label: "Gynaeasy Pro", color: "text-violet-600", bg: "bg-violet-50", icon: Star },
    PREMIUM: { label: "Gynaeasy Premium", color: "text-amber-600", bg: "bg-amber-50", icon: Star },
};

export default function SubscriptionView({ subscription }: { subscription: any }) {
    const plan = PLAN_MAP[subscription.plan] || PLAN_MAP.BASIQUE;
    const status = STATUS_MAP[subscription.statut] || STATUS_MAP.ACTIF;
    const PlanIcon = plan.icon;

    // Calcul du prix final avec réduction
    const basePrice = subscription.config?.prixMensuel || 0;
    let finalPrice = basePrice;
    if (subscription.reductionType === "POURCENTAGE" && subscription.reductionValeur) {
        finalPrice = basePrice * (1 - subscription.reductionValeur / 100);
    } else if (subscription.reductionType === "MONTANT_FIXE" && subscription.reductionValeur) {
        finalPrice = Math.max(0, basePrice - subscription.reductionValeur);
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`h-14 w-14 rounded-2xl ${plan.bg} flex items-center justify-center ${plan.color} border border-white`}>
                                <PlanIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800">{plan.label}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${status.bg} ${status.color}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium italic">Depuis le {format(new Date(subscription.dateDebut), "d MMMM yyyy", { locale: fr })}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-slate-800">{finalPrice.toLocaleString("fr-FR")} <span className="text-xs font-bold text-slate-400">FCFA/mois</span></div>
                            {subscription.reductionType && (
                                <div className="text-xs text-pink-600 font-bold bg-pink-50 px-3 py-1 rounded-full mt-2 inline-block">Offre Spéciale : -{subscription.reductionValeur}{subscription.reductionType === "POURCENTAGE" ? "%" : " FCFA"}</div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-50 pt-8 pb-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2 uppercase tracking-widest">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Vos avantages inclus
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {["Agenda Illimité", "Dossier Patient Numérique", "Statistiques du Cabinet", "Support Technique Réactif"].map((f) => (
                                <div key={f} className="flex items-center gap-3">
                                    <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-sm text-slate-600 font-medium">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 flex flex-col items-center text-center space-y-4">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Star className="h-40 w-40" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <h3 className="text-xl font-bold">Besoin de plus de puissance ?</h3>
                        <p className="text-indigo-100 text-sm max-w-sm">Passez au plan **Premium** pour débloquer l&apos;intelligence artificielle et le multi-cabinet.</p>
                        <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all transform hover:scale-105">
                            Comparer les offres
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Prochaines Échéances
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date de renouvellement</p>
                            <p className="text-sm font-black text-slate-800">
                                {subscription.dateFin ? format(new Date(subscription.dateFin), "d MMMM yyyy", { locale: fr }) : "Aucune date de fin"}
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Méthode de paiement</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-black text-slate-800">Prélèvement Bancaire</p>
                                <button className="text-[10px] font-bold text-indigo-600 hover:underline">Editer</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 flex items-start gap-4">
                    <Info className="h-5 w-5 text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Vos factures sont générées automatiquement chaque mois et vous sont envoyées par email. Vous pouvez également les télécharger ici.
                    </p>
                </div>
            </div>
        </div>
    );
}
