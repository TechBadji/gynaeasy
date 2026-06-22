"use client";

import React, { useState } from "react";
import { Check, X, Star, Shield, Building2, Loader2 } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { requestPlanUpgrade } from "@/app/actions/subscription";
import toast from "react-hot-toast";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import PromoCodeInput from "@/components/subscription/promo-code-input";

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    SOLO:     Shield,
    PRO:      Star,
    CLINIQUE: Building2,
};

const PLAN_CTA: Record<string, string> = {
    SOLO:     "Démarrer Solo",
    PRO:      "Choisir Pro",
    CLINIQUE: "Contacter Ventes",
};

const DEFAULT_FEATURES: Record<string, { text: string; included: boolean }[]> = {
    SOLO:     SUBSCRIPTION_PLANS[0].features,
    PRO:      SUBSCRIPTION_PLANS[1].features,
    CLINIQUE: SUBSCRIPTION_PLANS[2].features,
};

interface PlanConfig {
    plan: string;
    prixMensuel: number;
    prixAnnuel?: number | null;
    description?: string | null;
    features?: { text: string; included: boolean }[] | null;
    isPromotional?: boolean;
}

interface PricingCardsProps {
    currentPlan?: string;
    planConfigs?: PlanConfig[];
}

export default function PricingCards({ currentPlan, planConfigs = [] }: PricingCardsProps) {
    const [isPending, startTransition] = useTransition();
    const [pendingPlan, setPendingPlan] = useState<string | null>(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const [appliedPromo, setAppliedPromo] = useState<{ id: string; code: string; type: string; valeur: number } | null>(null);
    const router = useRouter();

    const handleUpgrade = (plan: string) => {
        if (plan === currentPlan) {
            toast.error("Vous utilisez déjà ce plan");
            return;
        }
        setPendingPlan(plan);
        startTransition(async () => {
            try {
                const res = await requestPlanUpgrade(plan);
                if (res.success) {
                    toast.success(res.message);
                    router.refresh();
                } else {
                    toast.error(res.message);
                }
            } catch {
                toast.error("Erreur technique lors du changement de plan");
            } finally {
                setPendingPlan(null);
            }
        });
    };

    const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

    // Construire les plans à afficher depuis la DB (ou le fallback statique)
    const plans = (["SOLO", "PRO", "CLINIQUE"] as const).map((id) => {
        const cfg = planConfigs.find(c => c.plan === id);
        const staticFallback = SUBSCRIPTION_PLANS.find(p => p.id === id.toLowerCase());
        const dbFeatures = cfg?.features && Array.isArray(cfg.features) && cfg.features.length > 0;
        return {
            id,
            name:         id === "SOLO" ? "SOLO / DÉMARRAGE" : id === "PRO" ? "CABINET PRO" : "CLINIQUE",
            prixMensuel:  cfg?.prixMensuel ?? staticFallback?.price ?? 0,
            prixAnnuel:   cfg?.prixAnnuel  ?? null,
            description:  cfg?.description ?? staticFallback?.description ?? "",
            features:     dbFeatures ? cfg!.features! : (DEFAULT_FEATURES[id] ?? []),
            isPopular:    id === "PRO",
        };
    });

    // Y a-t-il au moins un plan avec tarif annuel ?
    const hasAnnualOptions = plans.some(p => p.prixAnnuel != null);

    // Calcul de la réduction max pour l'affichage du badge "Annuel"
    const maxAnnualDiscount = Math.max(
        ...plans
            .filter(p => p.prixAnnuel)
            .map(p => Math.round((1 - p.prixAnnuel! / (p.prixMensuel * 12)) * 100)),
        0
    );

    return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                    Choisissez votre puissance
                </h2>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Des outils professionnels adaptés à la réalité du terrain sénégalais.
                </p>

                {/* Toggle mensuel / annuel — affiché seulement si au moins un plan a un prix annuel */}
                {hasAnnualOptions && (
                    <div className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={cn(
                                "px-5 py-1.5 rounded-full text-sm font-bold transition-all",
                                !isAnnual ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={cn(
                                "px-5 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                                isAnnual ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            Annuel
                            {maxAnnualDiscount > 0 && (
                                <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                                    -{maxAnnualDiscount}%
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Champ code promo */}
                <div className="mt-2 flex justify-center">
                    <PromoCodeInput onApply={(p) => setAppliedPromo(p as any)} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => {
                    const Icon = PLAN_ICONS[plan.id];
                    const isPro = plan.isPopular;
                    const isCurrent = plan.id === currentPlan;
                    const isLoading = pendingPlan === plan.id;

                    const showAnnual = isAnnual && plan.prixAnnuel != null;
                    const basePrice = showAnnual ? Math.round(plan.prixAnnuel! / 12) : plan.prixMensuel;
                    const promoDiscount = appliedPromo
                        ? appliedPromo.type === "POURCENTAGE"
                            ? Math.round(basePrice * appliedPromo.valeur / 100)
                            : Math.round(appliedPromo.valeur / 12)
                        : 0;
                    const displayPrice = Math.max(0, basePrice - promoDiscount);
                    const discount = plan.prixAnnuel
                        ? Math.round((1 - plan.prixAnnuel / (plan.prixMensuel * 12)) * 100)
                        : 0;

                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col transition-all duration-300 border-2",
                                isPro
                                    ? "border-violet-500 shadow-2xl scale-105 z-10 bg-white"
                                    : "border-slate-100 shadow-xl hover:shadow-2xl hover:border-slate-200 bg-slate-50/50"
                            )}
                        >
                            {isPro && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Badge className="bg-violet-600 text-white font-black px-4 py-1 uppercase tracking-widest text-[10px]">
                                        Le plus populaire
                                    </Badge>
                                </div>
                            )}

                            {/* Badge réduction annuelle */}
                            {showAnnual && discount > 0 && (
                                <div className="absolute top-3 right-3">
                                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow">
                                        -{discount}%
                                    </span>
                                </div>
                            )}

                            <CardHeader className="text-center pt-8">
                                <div className={cn(
                                    "mx-auto h-12 w-12 rounded-2xl flex items-center justify-center mb-4",
                                    isPro ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-600"
                                )}>
                                    <Icon className="h-6 w-6" />
                                </div>

                                <CardTitle className="text-xl font-black uppercase tracking-widest text-slate-800">
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className="text-slate-500 font-medium min-h-[40px]">
                                    {plan.description}
                                </CardDescription>

                                {/* Prix */}
                                <div className="mt-4 space-y-1">
                                    <div className="flex items-baseline justify-center gap-1">
                                        {promoDiscount > 0 && (
                                            <span className="text-lg font-bold text-slate-400 line-through">
                                                {fmt(basePrice)}
                                            </span>
                                        )}
                                        <span className={cn("text-4xl font-black", promoDiscount > 0 ? "text-emerald-600" : "text-slate-900")}>
                                            {fmt(displayPrice)}
                                        </span>
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                            FCFA / mois
                                        </span>
                                    </div>
                                    {promoDiscount > 0 && (
                                        <p className="text-xs text-emerald-600 font-bold">
                                            Code <span className="font-mono">{appliedPromo!.code}</span> appliqué 🎉
                                        </p>
                                    )}
                                    {showAnnual && (
                                        <p className="text-xs text-slate-500">
                                            soit {fmt(plan.prixAnnuel!)} FCFA facturés annuellement
                                        </p>
                                    )}
                                    {!showAnnual && plan.prixAnnuel && discount > 0 && !promoDiscount && (
                                        <p className="text-xs text-emerald-600 font-semibold">
                                            Économisez {discount}% avec l&apos;annuel
                                        </p>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 pt-6 pb-8">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className={cn(
                                                "h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                                                feature.included
                                                    ? "bg-emerald-100 text-emerald-600"
                                                    : "bg-slate-100 text-slate-400"
                                            )}>
                                                {feature.included
                                                    ? <Check className="h-3 w-3" />
                                                    : <X className="h-3 w-3" />
                                                }
                                            </div>
                                            <span className={cn(
                                                "text-sm font-medium",
                                                feature.included
                                                    ? "text-slate-700"
                                                    : "text-slate-400 line-through decoration-slate-300"
                                            )}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pb-8">
                                <Button
                                    disabled={isPending || isCurrent}
                                    onClick={() => handleUpgrade(plan.id)}
                                    className={cn(
                                        "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform hover:scale-[1.02] active:scale-[0.98]",
                                        isCurrent
                                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                            : isPro
                                                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-100"
                                                : "bg-slate-800 hover:bg-slate-900 text-white"
                                    )}
                                >
                                    {isLoading
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : isCurrent
                                            ? "Plan Actuel"
                                            : PLAN_CTA[plan.id]
                                    }
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    <Badge variant="outline" className="bg-emerald-100 border-none text-emerald-700 font-bold">Note</Badge>
                    <p className="text-xs text-emerald-800 font-medium italic">
                        Paiement par chèque, virement ou Orange Money / Wave disponible au Sénégal.
                    </p>
                </div>
            </div>
        </div>
    );
}
