"use client";

import { CheckCircle2, Shield, Clock, Info, Star, Building2, AlertTriangle, Phone, Zap, ArrowRight, Hourglass, XCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import SubscriptionInvoices from "./subscription-invoices";
import { trackAdImpression, trackAdClick } from "@/app/actions/superadmin";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    ACTIF:  { label: "Actif",   color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    EXPIRE: { label: "Expiré",  color: "text-amber-600",   bg: "bg-amber-50 border-amber-200" },
    ANNULE: { label: "Annulé",  color: "text-red-600",     bg: "bg-red-50 border-red-200" },
};

const PLAN_MAP: Record<string, { label: string; color: string; bg: string; icon: any; gradient: string }> = {
    SOLO:     { label: "Gynaeasy Solo",     color: "text-slate-600",  bg: "bg-slate-100",   icon: Shield,    gradient: "from-slate-500 to-slate-700" },
    PRO:      { label: "Gynaeasy Pro",      color: "text-violet-600", bg: "bg-violet-50",   icon: Star,      gradient: "from-violet-600 to-violet-800" },
    CLINIQUE: { label: "Gynaeasy Clinique", color: "text-amber-600",  bg: "bg-amber-50",    icon: Building2, gradient: "from-amber-500 to-amber-700" },
};

const PLAN_FEATURES: Record<string, string[]> = {
    SOLO:     ["Agenda illimité", "Dossier patient numérique", "Consultations & Ordonnances", "Imagerie médicale", "Support par email"],
    PRO:      ["Tout Solo inclus", "Statistiques du cabinet", "Rappels SMS automatiques", "Facturation CCAM", "Codes promo & promotions", "Support prioritaire"],
    CLINIQUE: ["Tout Pro inclus", "Multi-médecins & secrétariat", "Tableau de bord Clinique", "Personnalisation avancée", "Support dédié & formation", "SLA garanti"],
};

const PLAN_NAMES: Record<string, string> = { SOLO: "Solo", PRO: "Pro", CLINIQUE: "Clinique" };

export default function SubscriptionView({ subscription, activeAd, upgradeRequest }: {
    subscription: any; activeAd?: any;
    upgradeRequest?: { planActuel: string; planDemande: string; statut: string; noteAdmin?: string | null; createdAt: string } | null;
}) {
    const router = useRouter();
    const plan   = PLAN_MAP[subscription.plan] || PLAN_MAP.SOLO;
    const status = STATUS_MAP[subscription.statut] || STATUS_MAP.ACTIF;
    const PlanIcon = plan.icon;
    const impressionTracked = useRef(false);

    useEffect(() => {
        if (activeAd?.id && !impressionTracked.current) {
            impressionTracked.current = true;
            trackAdImpression(activeAd.id);
        }
    }, [activeAd?.id]);

    // Prix avec réduction
    const basePrice = subscription.config?.prixMensuel || 0;
    let finalPrice = basePrice;
    if (subscription.reductionType === "POURCENTAGE" && subscription.reductionValeur) {
        finalPrice = basePrice * (1 - subscription.reductionValeur / 100);
    } else if (subscription.reductionType === "MONTANT_FIXE" && subscription.reductionValeur) {
        finalPrice = Math.max(0, basePrice - subscription.reductionValeur);
    }

    // Jours restants
    const today   = new Date();
    const dateFin = subscription.dateFin ? new Date(subscription.dateFin) : null;
    const dateDebut = new Date(subscription.dateDebut);
    const daysLeft  = dateFin ? Math.max(0, differenceInDays(dateFin, today)) : null;
    const totalDays = dateFin ? Math.max(1, differenceInDays(dateFin, dateDebut)) : null;
    const progress  = (daysLeft !== null && totalDays !== null)
        ? Math.round(((totalDays - daysLeft) / totalDays) * 100)
        : null;

    const isUrgent  = daysLeft !== null && daysLeft <= 7;
    const isWarning = daysLeft !== null && daysLeft > 7 && daysLeft <= 30;

    const features = PLAN_FEATURES[subscription.plan] ?? PLAN_FEATURES.SOLO;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Colonne principale ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

                {/* ── Statut demande d'upgrade ───────────────────────────── */}
                {upgradeRequest && upgradeRequest.statut === "EN_ATTENTE" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-200">
                        <Hourglass className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-700 flex items-center gap-2">
                                Demande de passage au plan {PLAN_NAMES[upgradeRequest.planDemande]} en cours de traitement
                                <span className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                                    {PLAN_NAMES[upgradeRequest.planActuel]} <ArrowRight className="h-3 w-3" /> {PLAN_NAMES[upgradeRequest.planDemande]}
                                </span>
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                Envoyée le {format(new Date(upgradeRequest.createdAt), "d MMM yyyy", { locale: fr })} — vous serez notifié(e) par notification dès validation.
                            </p>
                        </div>
                    </div>
                )}

                {upgradeRequest && upgradeRequest.statut === "APPROUVE" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-emerald-50 border-emerald-200">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-emerald-700">
                                Votre passage au plan {PLAN_NAMES[upgradeRequest.planDemande]} a été approuvé
                            </p>
                            {upgradeRequest.noteAdmin && (
                                <p className="text-xs text-emerald-600 mt-0.5 italic">"{upgradeRequest.noteAdmin}"</p>
                            )}
                        </div>
                    </div>
                )}

                {upgradeRequest && upgradeRequest.statut === "REFUSE" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-red-50 border-red-200">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-700">
                                Demande de passage au plan {PLAN_NAMES[upgradeRequest.planDemande]} non retenue
                            </p>
                            {upgradeRequest.noteAdmin && (
                                <p className="text-xs text-red-600 mt-0.5 italic">"{upgradeRequest.noteAdmin}"</p>
                            )}
                            <p className="text-xs text-red-500 mt-1">Contactez le support pour en savoir plus.</p>
                        </div>
                    </div>
                )}

                {/* Alerte renouvellement urgent */}
                {(isUrgent || isWarning) && subscription.statut === "ACTIF" && (
                    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                        <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isUrgent ? "text-red-500" : "text-amber-500"}`} />
                        <div>
                            <p className={`text-sm font-bold ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
                                {isUrgent
                                    ? `Abonnement expirant dans ${daysLeft} jour${daysLeft !== 1 ? "s" : ""} !`
                                    : `Abonnement expirant dans ${daysLeft} jours`}
                            </p>
                            <p className={`text-xs mt-0.5 ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
                                Contactez votre administrateur pour renouveler votre accès.
                            </p>
                        </div>
                    </div>
                )}

                {/* Carte plan principal */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    {/* Header gradient */}
                    <div className={`bg-gradient-to-r ${plan.gradient} p-6 text-white`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <PlanIcon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Plan actuel</p>
                                    <h2 className="text-2xl font-black mt-0.5">{plan.label}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.bg} ${status.color}`}>
                                            {status.label}
                                        </span>
                                        <span className="text-white/60 text-xs">
                                            depuis le {format(dateDebut, "d MMM yyyy", { locale: fr })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {subscription.reductionType && (
                                    <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full mb-2 inline-block">
                                        -{subscription.reductionValeur}{subscription.reductionType === "POURCENTAGE" ? "%" : " FCFA"}
                                    </div>
                                )}
                                <div className="text-3xl font-black">{finalPrice.toLocaleString("fr-FR")}</div>
                                <div className="text-white/70 text-xs font-bold uppercase tracking-wider">FCFA / mois</div>
                            </div>
                        </div>
                    </div>

                    {/* Corps */}
                    <div className="p-6 space-y-6">
                        {/* Barre de progression abonnement */}
                        {dateFin && progress !== null && subscription.statut === "ACTIF" && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500">Période en cours</span>
                                    <span className={`text-xs font-black ${isUrgent ? "text-red-500" : isWarning ? "text-amber-500" : "text-slate-700"}`}>
                                        {daysLeft} jour{daysLeft !== 1 ? "s" : ""} restant{daysLeft !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${isUrgent ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-slate-400">{format(dateDebut, "d MMM yy", { locale: fr })}</span>
                                    <span className="text-[10px] text-slate-400">{format(dateFin, "d MMM yy", { locale: fr })}</span>
                                </div>
                            </div>
                        )}

                        {/* Fonctionnalités incluses */}
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Inclus dans votre plan
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {features.map((f) => (
                                    <div key={f} className="flex items-center gap-2.5">
                                        <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Factures */}
                <SubscriptionInvoices
                    factures={subscription.factures || []}
                    onUpdate={() => router.refresh()}
                />

                {/* Publicité partenaire ou upsell */}
                {activeAd ? (
                    <a
                        href={activeAd.lienClick || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackAdClick(activeAd.id)}
                        className={`bg-gradient-to-br ${activeAd.couleur || "from-violet-600 to-violet-800"} rounded-3xl p-8 text-white relative overflow-hidden shadow-xl flex flex-col items-center text-center space-y-4 group cursor-pointer block hover:scale-[1.01] transition-transform`}
                    >
                        {activeAd.imageUrl && (
                            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={activeAd.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {!activeAd.imageUrl && (
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Star className="h-40 w-40" />
                            </div>
                        )}
                        <div className="relative z-10 space-y-2">
                            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                                Partenaire : {activeAd.partenaire}
                            </span>
                            <h3 className="text-xl font-bold mt-2">{activeAd.titre}</h3>
                            <p className="text-white/80 text-sm max-w-sm">{activeAd.description}</p>
                            <div className="pt-2">
                                <span className="inline-block bg-white/90 text-slate-800 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg group-hover:bg-white transition-colors">
                                    Découvrir l&apos;offre
                                </span>
                            </div>
                        </div>
                    </a>
                ) : (
                    subscription.plan !== "CLINIQUE" && (
                        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-violet-100 flex flex-col items-center text-center space-y-4">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Zap className="h-40 w-40" />
                            </div>
                            <div className="relative z-10 space-y-3">
                                <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto">
                                    <Star className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Besoin de plus de puissance ?</h3>
                                <p className="text-violet-200 text-sm max-w-sm">
                                    Passez au plan <strong className="text-white">Clinique</strong> pour débloquer le multi-médecins, le support dédié et la personnalisation avancée.
                                </p>
                                <button
                                    onClick={() => window.scrollTo({ top: 900, behavior: "smooth" })}
                                    className="bg-white text-violet-700 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-violet-50 transition-all"
                                >
                                    Comparer les offres
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* ── Colonne latérale ───────────────────────────────────────── */}
            <div className="space-y-5">
                {/* Échéances */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Échéances
                    </h3>

                    <div className={`p-4 rounded-2xl border ${isUrgent ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100"}`}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date de renouvellement</p>
                        <p className={`text-sm font-black ${isUrgent ? "text-red-600" : "text-slate-800"}`}>
                            {dateFin ? format(dateFin, "d MMMM yyyy", { locale: fr }) : "Sans date de fin"}
                        </p>
                        {daysLeft !== null && (
                            <p className={`text-xs font-bold mt-1 ${isUrgent ? "text-red-500" : isWarning ? "text-amber-500" : "text-emerald-600"}`}>
                                {daysLeft > 0 ? `J−${daysLeft}` : "Expiré"}
                            </p>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Méthode de paiement</p>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-black text-slate-800">Wave / Orange Money</p>
                        </div>
                    </div>
                </div>

                {/* Contact renouvellement */}
                <div className="bg-violet-50 rounded-3xl border border-violet-100 p-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-violet-600" />
                        <h3 className="text-sm font-bold text-violet-800">Renouvellement & Support</h3>
                    </div>
                    <p className="text-xs text-violet-700 leading-relaxed">
                        Pour renouveler votre abonnement ou toute question sur votre compte, contactez notre équipe.
                    </p>
                    <a
                        href="mailto:support@gynaeasy.digitalmatis.com"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors"
                    >
                        Contacter le support
                    </a>
                </div>

                {/* Info factures */}
                <div className="bg-slate-50 rounded-3xl border border-slate-100 p-5 flex items-start gap-3">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Vos factures sont générées le 1er de chaque mois et disponibles en téléchargement dans l'historique ci-dessus.
                    </p>
                </div>
            </div>
        </div>
    );
}
