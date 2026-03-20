"use client";

import { useState } from "react";
import { 
    Shield, 
    Lock, 
    Eye, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Database, 
    UserCheck, 
    ArrowRightLeft, 
    Scale, 
    Globe2,
    CalendarCheck,
    FileStack,
    Zap,
    History,
    CreditCard // Added CreditCard icon
} from "lucide-react";

export default function PrivacyPage() {
    const [view, setView] = useState<"privacy" | "terms">("privacy");

    const privacySections = [
        {
            id: "hds",
            title: "Hébergement & Sécurité HDS",
            icon: <Database className="h-6 w-6 text-violet-600" />,
            content: "Toutes les données de santé traitées par Gynaeasy sont stockées sur des serveurs certifiés HDS (Hébergement de Données de Santé) situés en Union Européenne. Nous appliquons un chiffrement AES-256 pour les données au repos et le protocole TLS 1.3 pour tous les échanges.",
            badges: ["Certifié HDS", "Chiffrement AES-256", "TLS 1.3"]
        },
        {
            id: "nature",
            title: "Nature des Données Traitées",
            icon: <FileText className="h-6 w-6 text-pink-600" />,
            content: "Nous distinguons deux types de données : les données administratives du praticien (identité, facturation) et les données médicales des patients (antécédents, consultations, imagerie). Ces dernières sont strictement confidentielles et uniquement accessibles au praticien traitant.",
            badges: ["Médical Secret Privé", "Zéro Usage Commercial"]
        },
        {
            id: "propriete",
            title: "Propriété & Portabilité",
            icon: <ArrowRightLeft className="h-6 w-6 text-blue-600" />,
            content: "Conformément à la déontologie médicale, vous restez l'unique propriétaire de vos données. Vous disposez d'un droit de portabilité vous permettant d'exporter l'intégralité de vos dossiers patients aux formats standards (CSV, JSON, PDF) à tout moment.",
            badges: ["Export Libre", "Données Maître"]
        },
        {
            id: "legal",
            title: "Conformité Légale (CDP & RGPD)",
            icon: <Scale className="h-6 w-6 text-emerald-600" />,
            content: "Gynaeasy est en conformité totale avec le Règlement Général sur la Protection des Données (RGPD) ainsi qu'avec la loi sénégalaise n° 2008-12 portant sur la protection des données à caractère personnel (CDP).",
            badges: ["Conforme RGPD", "Conforme CDP Sénégal"]
        }
    ];

    const cguSections = [
        {
            title: "Objet du Service",
            icon: <Zap className="h-6 w-6 text-amber-600" />,
            content: "Gynaeasy fournit un logiciel SaaS de gestion de cabinet médical incluant : téléconsultation, gestion des patients, facturation CCAM, et stockage d'imagerie. L'utilisation du service est strictement réservée aux professionnels de santé.",
            badges: ["SaaS Médical", "Gestion Cabinet"]
        },
        {
            title: "Abonnement & Facturation",
            icon: <CreditCard className="h-6 w-6 text-indigo-600" />,
            content: "L'abonnement est sans engagement de durée longue (sauf mention contraire). La facturation est mensuelle. En cas de retard de paiement, une suspension temporaire peut intervenir après 15 jours.",
            badges: ["Sans Engagement", "Mensualité Fixe"]
        },
        {
            title: "Disponibilité & SLA (99.9%)",
            icon: <History className="h-6 w-6 text-cyan-600" />,
            content: "Nous garantissons un taux de disponibilité service de 99.9%. Les maintenances prévisibles sont effectuées hors heures de consultation (entre 22h et 06h GMT) et notifiées 48h à l'avance.",
            badges: ["Disponibilité 99.9%", "SLA Médical"]
        },
        {
            title: "Résiliation & Données",
            icon: <ArrowRightLeft className="h-6 w-6 text-rose-600" />,
            content: "La résiliation entraîne l'arrêt des prélèvements. Vos données restent accessibles en lecture seule pendant 3 mois pour vous permettre l'export, avant suppression définitive et irréversible de nos serveurs.",
            badges: ["Droit de Sortie", "Export Sécurisé"]
        }
    ];

    const rights = [
        { title: "Droit d'accès", desc: "Consulter l'ensemble de vos données stockées." },
        { title: "Droit de rectification", desc: "Mettre à jour vos informations à tout moment." },
        { title: "Droit à l'oubli", desc: "Demander la suppression définitive de votre compte." },
        { title: "Droit d'opposition", desc: "Refuser le traitement de certaines données non essentielles." }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
            {/* Header with Switcher Tabs */}
            <div className="text-center space-y-8 pt-12">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-4 border border-white/10 shadow-xl">
                    <Shield className="h-3 w-3 text-pink-500" /> Cadre Juridique Gynaeasy
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                    L'Alliance de la <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600">Confiance</span>
                </h1>

                {/* Visual Tab Switcher */}
                <div className="flex justify-center mt-12 p-1.5 bg-slate-100 rounded-3xl max-w-lg mx-auto border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setView("privacy")}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${view === "privacy" ? "bg-white text-violet-600 shadow-xl" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <Lock className="h-4 w-4" />
                        Confidentialité
                    </button>
                    <button
                        onClick={() => setView("terms")}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${view === "terms" ? "bg-white text-indigo-600 shadow-xl" : "text-slate-500 hover:text-slate-900"}`}
                    >
                        <FileStack className="h-4 w-4" />
                        Conditions Générales
                    </button>
                </div>
            </div>

            {/* Render Content Based on View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                {(view === "privacy" ? privacySections : cguSections).map((section, i) => (
                    <div key={i} className="bg-white rounded-[3rem] border border-slate-100 p-10 hover:shadow-2xl hover:border-violet-100 transition-all group shadow-sm">
                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-violet-50 transition-colors border border-slate-50 shadow-inner">
                            {section.icon}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{section.title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-8">{section.content}</p>
                        <div className="flex flex-wrap gap-2">
                            {section.badges.map((badge, j) => (
                                <span key={j} className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-wider">{badge}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {view === "privacy" && <PrivacyDetails rights={rights} />}

            {/* Footer with Links Switcher */}
            <div className="text-center max-w-2xl mx-auto space-y-6">
                <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                    Dernière mise à jour : 20 Mars 2026. Ce document est opposable à tous les utilisateurs du service Gynaeasy.
                </p>
                <div className="flex justify-center gap-8">
                    <button
                        onClick={() => setView("terms")}
                        className={`text-sm font-black uppercase tracking-widest transition-colors ${view === "terms" ? "text-pink-600" : "text-slate-900 hover:text-pink-600"}`}
                    >
                        Conditions Générales
                    </button>
                    <button
                        onClick={() => setView("privacy")}
                        className={`text-sm font-black uppercase tracking-widest transition-colors ${view === "privacy" ? "text-pink-600" : "text-slate-900 hover:text-pink-600"}`}
                    >
                        Confidentialité
                    </button>
                    <button className="text-sm font-black text-slate-900 uppercase tracking-widest hover:text-pink-600 transition-colors">Contact DPO</button>
                </div>
            </div>
        </div>
    );
}

// Support Components or Sections for Privacy only
function PrivacyDetails({ rights }: { rights: any[] }) {
    return (
        <div className="space-y-16">
            <div className="bg-slate-900 rounded-[3.5rem] p-16 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-pink-600/10 pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-16">
                    <div className="lg:w-1/3 space-y-6">
                        <h2 className="text-4xl font-black tracking-tight leading-snug">Vos droits en tant qu'utilisateur</h2>
                        <p className="text-slate-400 font-medium leading-relaxed">En vertu du RGPD, vous disposez d'un contrôle total sur les informations que vous nous confiez.</p>
                        <div className="pt-8">
                             <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                 <UserCheck className="h-6 w-6 text-pink-500" />
                                 <span className="text-sm font-bold">Déléguée à la Protection des Données (DPO) : Dr Anna Badji</span>
                             </div>
                        </div>
                    </div>
                    <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {rights.map((right, i) => (
                            <div key={i} className="p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors">
                                <h4 className="text-xl font-black mb-2 text-pink-400">{right.title}</h4>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{right.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CalendarCheck className="h-7 w-7" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Durée de Conservation</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Les dossiers patients sont conservés pendant toute la durée de vie de votre cabinet. En cas de résiliation, vos données sont conservées **3 mois** pour export, puis définitivement supprimées, sauf obligation légale contraire (ex: prescriptions médicales 10-20 ans).
                    </p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <Globe2 className="h-5 w-5 text-indigo-500" />
                        <h4 className="font-bold text-slate-800">Partenaires Tiers</h4>
                    </div>
                    <ul className="space-y-4">
                        {[
                            { name: "Neon Database", use: "Stockage chiffré des données de base" },
                            { name: "Resend", use: "Envoi des emails de notification" },
                            { name: "Orange SMS", use: "Notifications et rappels RDV" }
                        ].map((p, i) => (
                            <li key={i} className="flex justify-between items-center text-sm">
                                <span className="font-black text-slate-700">{p.name}</span>
                                <span className="text-slate-400 font-medium italic">{p.use}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
