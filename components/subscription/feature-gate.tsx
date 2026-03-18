import React from 'react';
import { checkPlanFeature, FeatureKey } from "@/lib/subscriptions";
import { Lock } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface FeatureGateProps {
    planId?: string | null;
    featureName: FeatureKey;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    showUpgradeLink?: boolean;
}

export function FeatureGate({
    planId,
    featureName,
    children,
    fallback,
    showUpgradeLink = true
}: FeatureGateProps) {
    const hasAccess = checkPlanFeature(featureName, planId);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10" />
            
            <div className="relative z-20 flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
                    <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Fonctionnalité Verrouillée</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                        Votre abonnement actuel ne permet pas d'accéder à <strong>{featureName}</strong>.
                    </p>
                </div>
                
                {showUpgradeLink && (
                    <Link href="/abonnement">
                        <Button className="mt-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold">
                            Mettre à niveau mon plan
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}
