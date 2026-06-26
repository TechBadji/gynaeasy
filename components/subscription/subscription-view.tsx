"use client";

import {
    CheckCircle2, Shield, Clock, Info, Star, Building2,
    AlertTriangle, Phone, Zap, ArrowRight, Hourglass, XCircle,
    CalendarCheck, Infinity,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import SubscriptionInvoices from "./subscription-invoices";
import { trackAdImpression, trackAdClick } from "@/app/actions/superadmin";

const FALLBACK_PRICES: Record<string, number> = { SOLO: 25000, PRO: 50000, CLINIQUE: 95000 };

const STATUS_MAP: Record<string, { label: string; dotColor: string; textColor: string; bg: string }> = {
    ACTIF:  { label: "Actif",   dotColor: "bg-emerald-400", textColor: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
    EXPIRE: { label: "Expiré",  dotColor: "bg-amber-400",   textColor: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
    ANNULE: { label: "Annulé",  dotColor: "bg-red-400",     textColor: "text-red-700",     bg: "bg-red-50 border-red-200" },
};

const PLAN_MAP: Record<string, { label: string; icon: any; gradient: string; ring: string }> = {
    SOLO:     { label: "Gynaeasy Solo",     icon: Shield,    gradient: "from-slate-600 to-slate-800",  ring: "ring-slate-200" },
    PRO:      { label: "Gynaeasy Pro",      icon: Star,      gradient: "from-violet-600 to-violet-800", ring: "ring-violet-200" },
    CLINIQUE: { label: "Gynaeasy Clinique", icon: Building2, gradient: "from-amber-500 to-amber-700",  ring: "ring-amber-200" },
};

const PLAN_FEATURES: Record<string, string[]> = {
    SOLO:     ["Agenda illimité", "Dossier patient numérique", "Consultations & Ordonnances", "Imagerie médicale", "Support par email"],
    PRO:      ["Tout Solo inclus", "Statistiques du cabinet", "Rappels SMS automatiques", "Facturation CCAM", "Codes promo & promotions", "Support prioritaire"],
    CLINIQUE: ["Tout Pro inclus", "Multi-médecins & secrétariat", "Tableau de bord Clinique", "Personnalisation avancée", "Support dédié & formation", "SLA garanti"],
};

const PLAN_NAMES: Record<string, string> = { SOLO: "Solo", PRO: "Pro", CLINIQUE: "Clinique" };

export default function SubscriptionView({ subscription, activeAd, upgradeRequest }: {
    subscription: any;
    activeAd?: any;
    upgradeRequest?: { planActuel: string; planDemande: string; statut: string; noteAdmin?: string | null; createdAt: string } | null;
}) {
    const router = useRouter();
    const plan     = PLAN_MAP[subscription.plan]   || PLAN_MAP.SOLO;
    const status   = STATUS_MAP[subscription.statut] || STATUS_MAP.ACTIF;
    const PlanIcon = plan.icon;
    const impressionTracked = useRef(false);

    useEffect(() => {
        if (activeAd?.id && !impressionTracked.current) {
            impressionTracked.current = true;
            trackAdImpression(activeAd.id);
        }
    }, [activeAd?.id]);

    // Prix (config DB → fallback statique)
    const basePrice  = subscription.config?.prixMensuel || FALLBACK_PRICES[subscription.plan] || 0;
    let finalPrice   = basePrice;
    if (subscription.reductionType === "POURCENTAGE" && subscription.reductionValeur)
        finalPrice = basePrice * (1 - subscription.reductionValeur / 100);
    else if (subscription.reductionType === "MONTANT_FIXE" && subscription.reductionValeur)
        finalPrice = Math.max(0, basePrice - subscription.reductionValeur);

    // Dates et jours restants
    const today     = new Date();
    const dateDebut = new Date(subscription.dateDebut);
    const dateFin   = subscription.dateFin ? new Date(subscription.dateFin) : null;
    const daysLeft  = dateFin ? Math.max(0, differenceInDays(dateFin, today)) : null;
    const totalDays = dateFin ? Math.max(1, differenceInDays(dateFin, dateDebut)) : null;
    const progress  = daysLeft !== null && totalDays !== null
        ? Math.round(((totalDays - daysLeft) / totalDays) * 100) : null;

    const isUrgent  = daysLeft !== null && daysLeft <= 7;
    const isWarning = daysLeft !== null && daysLeft > 7 && daysLeft <= 30;

    const features = PLAN_FEATURES[subscription.plan] ?? PLAN_FEATURES.SOLO;
    const isActif  = subscription.statut === "ACTIF";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Colonne principale ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

                {/* Bandeau statut demande upgrade */}
                {upgradeRequest?.statut === "EN_ATTENTE" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-amber-50 border-amber-200">
                        <Hourglass className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-700">
                                Demande de passage au plan {PLAN_NAMES[upgradeRequest.planDemande]} en cours de traitement
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                                Envoyée le {format(new Date(upgradeRequest.createdAt), "d MMM yyyy", { locale: fr })}
                                <span className="mx-1">·</span>
                                {PLAN_NAMES[upgradeRequest.planActuel]}
                                <ArrowRight className="h-3 w-3 mx-0.5" />
                                {PLAN_NAMES[upgradeRequest.planDemande]}
                            </p>
                        </div>
                    </div>
                )}
                {upgradeRequest?.statut === "APPROUVE" && (
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
                {upgradeRequest?.statut === "REFUSE" && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-red-50 border-red-200">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-red-700">
                                Demande de passage au plan {PLAN_NAMES[upgradeRequest.planDemande]} non retenue
                            </p>
                            {upgradeRequest.noteAdmin && <p className="text-xs text-red-600 mt-0.5 italic">"{upgradeRequest.noteAdmin}"</p>}
                        </div>
                    </div>
                )}

                {/* Alerte renouvellement */}
                {(isUrgent || isWarning) && isActif && (
                    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                        <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isUrgent ? "text-red-500" : "text-amber-500"}`} />
                        <p className={`text-sm font-bold ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
                            {isUrgent
                                ? `Abonnement expirant dans ${daysLeft} jour${daysLeft !== 1 ? "s" : ""} — contactez le support pour renouveler.`
                                : `Abonnement expirant dans ${daysLeft} jours.`}
                        </p>
                    </div>
                )}

                {/* ── Carte abonnement en cours ──────────────────────────── */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">

                    {/* Header gradient */}
                    <div className={`bg-gradient-to-r ${plan.gradient} p-6 text-white`}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30`}>
                                    <PlanIcon className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Abonnement en cours</span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${status.bg} ${status.textColor}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
                                            {status.label}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-black">{plan.label}</h2>
                                    <p className="text-white/60 text-xs mt-0.5">
                                        Depuis le {format(dateDebut, "d MMMM yyyy", { locale: fr })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                {subscription.reductionType && (
                                    <div className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full mb-2 inline-block">
                                        -{subscription.reductionValeur}{subscription.reductionType === "POURCENTAGE" ? "%" : " FCFA"}
                                    </div>
                                )}
                                <div className="text-3xl font-black">{finalPrice.toLocaleString("fr-FR")}</div>
                                <div className="text-white/60 text-xs font-semibold">FCFA / mois</div>
                            </div>
                        </div>
                    </div>

                    {/* Corps */}
                    <div className="p-6 space-y-6">

                        {/* Période / barre de progression */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                    <CalendarCheck className="h-3.5 w-3.5" />
                                    Période d'abonnement
                                </div>
                                {daysLeft !== null ? (
                                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                                        isUrgent  ? "bg-red-50 text-red-600" :
                                        isWarning ? "bg-amber-50 text-amber-600" :
                                        "bg-emerald-50 text-emerald-700"
                                    }`}>
                                        {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}` : "Expiré"}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full">
                                        <Infinity className="h-3 w-3" />
                                        Sans date de fin
                                    </span>
                                )}
                            </div>

                            {dateFin && progress !== null ? (
                                <>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${
                                                isUrgent ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                                            }`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] text-slate-400">{format(dateDebut, "d MMM yyyy", { locale: fr })}</span>
                                        <span className="text-[10px] text-slate-400">{format(dateFin, "d MMM yyyy", { locale: fr })}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full animate-pulse" />
                                </div>
                            )}
                        </div>

                        {/* Fonctionnalités incluses */}
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Inclus dans ce plan
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {features.map(f => (
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

                {/* Historique factures */}
                <SubscriptionInvoices
                    factures={subscription.factures || []}
                    onUpdate={() => router.refresh()}
                />

                {/* Pub partenaire ou upsell */}
                {activeAd ? (
                    <a
                        href={activeAd.lienClick || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackAdClick(activeAd.id)}
                        className={`bg-gradient-to-br ${activeAd.couleur || "from-violet-600 to-violet-800"} rounded-3xl p-8 text-white relative overflow-hidden shadow-xl flex flex-col items-center text-center space-y-4 group cursor-pointer block hover:scale-[1.01] transition-transform`}
                    >
                        {activeAd.imageUrl ? (
                            <div className="absolute inset-0 opacity-20 mix-blend-overlay">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={activeAd.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                        ) : (
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
                            <span className="inline-block bg-white/90 text-slate-800 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg group-hover:bg-white transition-colors mt-2">
                                Découvrir l&apos;offre
                            </span>
                        </div>
                    </a>
                ) : subscription.plan !== "CLINIQUE" && (
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
                                Passez au plan <strong className="text-white">
                                    {subscription.plan === "SOLO" ? "Pro" : "Clinique"}
                                </strong> pour débloquer plus de fonctionnalités.
                            </p>
                            <button
                                onClick={() => window.scrollTo({ top: 9999, behavior: "smooth" })}
                                className="bg-white text-violet-700 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-violet-50 transition-all"
                            >
                                Comparer les offres
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Colonne latérale ───────────────────────────────────────── */}
            <div className="space-y-5">

                {/* Récapitulatif rapide */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <div className={`bg-gradient-to-r ${plan.gradient} px-5 py-4 flex items-center gap-3`}>
                        <PlanIcon className="h-4 w-4 text-white/80" />
                        <span className="text-white font-bold text-sm">{plan.label}</span>
                        <span className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${status.bg} ${status.textColor}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
                            {status.label}
                        </span>
                    </div>
                    <div className="p-5 space-y-4">

                        {/* Infos clés */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-slate-500">Tarif mensuel</span>
                                <span className="text-sm font-black text-slate-900">
                                    {finalPrice.toLocaleString("fr-FR")} FCFA
                                    {subscription.reductionType && (
                                        <span className="ml-1.5 text-[10px] font-bold text-violet-600 line-through opacity-60">
                                            {basePrice.toLocaleString("fr-FR")}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-slate-500">Début</span>
                                <span className="text-xs font-bold text-slate-700">{format(dateDebut, "d MMM yyyy", { locale: fr })}</span>
                            </div>
                            {dateFin ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500">Renouvellement</span>
                                    <span className={`text-xs font-bold ${isUrgent ? "text-red-600" : "text-slate-700"}`}>
                                        {format(dateFin, "d MMM yyyy", { locale: fr })}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500">Durée</span>
                                    <span className="text-xs font-bold text-violet-600 flex items-center gap-1">
                                        <Infinity className="h-3 w-3" /> Illimitée
                                    </span>
                                </div>
                            )}
                            {daysLeft !== null && (
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500">Jours restants</span>
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                        isUrgent  ? "bg-red-50 text-red-600" :
                                        isWarning ? "bg-amber-50 text-amber-600" :
                                        "bg-emerald-50 text-emerald-700"
                                    }`}>
                                        J−{daysLeft}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Méthode paiement */}
                        <div className="pt-3 border-t border-slate-50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Méthode de paiement</p>
                            <p className="text-xs font-bold text-slate-700">Wave / Orange Money</p>
                        </div>
                    </div>
                </div>

                {/* Contact support */}
                <div className="bg-violet-50 rounded-3xl border border-violet-100 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-violet-600" />
                        <h3 className="text-sm font-bold text-violet-800">Support & Renouvellement</h3>
                    </div>
                    <p className="text-xs text-violet-700 leading-relaxed">
                        Pour renouveler votre abonnement, changer de plan ou toute question sur votre compte, contactez notre équipe.
                    </p>
                    <a
                        href="mailto:support@gynaeasy.digitalmatis.com"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors"
                    >
                        Contacter le support
                    </a>
                </div>

                {/* Info factures */}
                <div className="bg-slate-50 rounded-3xl border border-slate-100 p-4 flex items-start gap-3">
                    <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Vos factures sont générées le 1er de chaque mois et disponibles en téléchargement dans l'historique.
                    </p>
                </div>
            </div>
        </div>
    );
}
