import { getUserSubscription } from "@/app/actions/subscription";
import SubscriptionView from "@/components/subscription/subscription-view";
import { CreditCard, Shield, AlertTriangle } from "lucide-react";

export default async function AbonnementPage() {
    const sub = await getUserSubscription();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                    <CreditCard className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Mon Abonnement</h1>
                    <p className="text-sm text-slate-500 font-medium">Gérez votre offre Gynaeasy et vos factures.</p>
                </div>
            </div>

            {sub ? (
                <SubscriptionView subscription={sub} />
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Aucun abonnement actif</h2>
                        <p className="text-slate-500 max-w-sm mt-1">Vous n&apos;avez pas encore d&apos;offre active. Veuillez contacter le support ou choisir un plan pour débloquer toutes les fonctionnalités.</p>
                    </div>
                    <button className="bg-violet-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-violet-700 transition-colors">
                        Voir les tarifs
                    </button>
                </div>
            )}
        </div>
    );
}
