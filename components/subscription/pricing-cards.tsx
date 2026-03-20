"use client";

import React from "react";
import { Check, X, Star, Shield, Building2 } from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { requestPlanUpgrade } from "@/app/actions/subscription";
import toast from "react-hot-toast";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

const PLAN_ICONS: Record<string, any> = {
  solo: Shield,
  pro: Star,
  clinique: Building2,
};

export default function PricingCards({ currentPlan }: { currentPlan?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = (planId: string) => {
    console.log("DEBUG handleUpgrade:", { planId, currentPlan });
    if (planId.toUpperCase() === currentPlan?.toUpperCase()) {
      toast.error("Vous utilisez déjà ce plan");
      return;
    }

    startTransition(async () => {
      try {
        const res = await requestPlanUpgrade(planId);
        console.log("DEBUG UPGRADE RES:", res);
        if (res.success) {
          toast.success(res.message);
          setTimeout(() => window.location.reload(), 1500); // Reload after toast
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.error("DEBUG UPGRADE ERR:", error);
        toast.error("Erreur technique lors du changement de plan");
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">Choisissez votre puissance</h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Des outils professionnels adaptés à la réalité du terrain sénégalais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const Icon = PLAN_ICONS[plan.id];
          const isPro = plan.id === "pro";

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
                  <Badge variant="default" className="bg-violet-600 text-white font-black px-4 py-1 uppercase tracking-widest text-[10px]">
                    Le plus populaire
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <div className={cn(
                  "mx-auto h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  isPro ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-600"
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-widest text-slate-800">{plan.name}</CardTitle>
                <CardDescription className="text-slate-500 font-medium min-h-[40px]">{plan.description}</CardDescription>
                
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-slate-900">{formatPrice(plan.price)}</span>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{plan.currency} / {plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pt-6 pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        feature.included ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                      )}>
                        {feature.included ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        feature.included ? "text-slate-700" : "text-slate-400 line-through decoration-slate-300"
                      )}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-8">
                <Button 
                  disabled={isPending || plan.id.toUpperCase() === currentPlan?.toUpperCase()}
                  onClick={() => handleUpgrade(plan.id)}
                  className={cn(
                    "w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform hover:scale-[1.02] active:scale-[0.98]",
                    plan.id.toUpperCase() === currentPlan?.toUpperCase() 
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : isPro 
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-100" 
                        : "bg-slate-800 hover:bg-slate-900 text-white"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : plan.id.toUpperCase() === currentPlan?.toUpperCase() ? (
                    "Plan Actuel"
                  ) : (
                    plan.cta
                  )}
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
            Paiement par chèque, virement ou Orange Money/Wave disponible (Paiement au Sénégal).
          </p>
        </div>
      </div>
    </div>
  );
}
