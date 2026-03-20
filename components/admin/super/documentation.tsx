"use client";

import { useState } from "react";
import { BookOpen, FileText, ChevronRight, Menu, X, Shield, User, HeartPulse } from "lucide-react";

const DOCS = [
    {
        category: "Introduction",
        items: [
            {
                id: "intro",
                title: "Bienvenue sur Gynaeasy",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Introduction à Gynaeasy</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Gynaeasy est un logiciel SaaS complet de gestion de cabinet médical spécialement conçu pour la gynécologie, l'obstétrique et la médecine générale. Cette documentation a pour but de former les futurs Super Administrateurs au fonctionnement de l'application, en détaillant les accès et fonctionnalités rôle par rôle.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="text-lg font-bold text-emerald-400 mb-2">Objectifs</h3>
                                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                    <li>Centraliser la gestion médicale</li>
                                    <li>Structurer la prise de rendez-vous</li>
                                    <li>Gérer la facturation et les inventaires</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )
            }
        ]
    },
    {
        category: "Rôle : Médecin",
        icon: <HeartPulse className="h-4 w-4 text-pink-400" />,
        items: [
            {
                id: "doc-dashboard",
                title: "Tableau de Bord & Stats",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400">Tableau de Bord & Statistiques</h2>
                        <p className="text-slate-300">
                            Le tableau de bord est le centre d'opérations du médecin. Il rassemble :
                        </p>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                            <li><strong>KPIs en temps réel :</strong> Nombre de patients, chiffre d'affaires du jour, consultations à venir.</li>
                            <li><strong>Alertes :</strong> Rappels automatiques pour les suivis de grossesses, stocks critiques (médicaments/matériel), ou abonnements à renouveler.</li>
                            <li><strong>Rendez-vous à venir :</strong> Liste simplifiée des prochaines consultations du jour.</li>
                        </ul>
                    </div>
                )
            },
            {
                id: "doc-patients",
                title: "Gestion des Patients",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400">Dossier Médical & Patients</h2>
                        <p className="text-slate-300">
                            Une interface structurée permettant la gestion d'un dossier médical sécurisé.
                        </p>
                        <ul className="space-y-3 text-slate-300 mt-2">
                            <li className="bg-white/5 p-3 rounded-lg border border-white/10"><strong>Fiche Patient :</strong> Informations de contact, antécédents, groupe sanguin et spécificités médicales.</li>
                            <li className="bg-white/5 p-3 rounded-lg border border-white/10"><strong>Historique des consultations :</strong> Retrace les diagnostics passés, constantes vitales, échographies et prescriptions.</li>
                            <li className="bg-white/5 p-3 rounded-lg border border-white/10"><strong>Formulaire Structuré :</strong> Champs spécifiques aux gynécologues (DDR, grossesses passées, etc.).</li>
                            <li className="bg-white/5 p-3 rounded-lg border border-white/10"><strong>Génération d'ordonnance :</strong> Conversion automatique des prescriptions en PDF imprimable.</li>
                        </ul>
                    </div>
                )
            },
            {
                id: "doc-agenda",
                title: "Agenda & Réservation",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400">Agenda & Rendez-vous</h2>
                        <p className="text-slate-300">
                            L'agenda gère la planification complète du cabinet, synchronisée avec les secrétaires. Il supporte des codes patients sécurisés envoyés par SMS.
                        </p>
                        <Alert 
                            title="Code Patient (Sécurité)" 
                            desc="Chaque patient reçoit un code unique à 5 chiffres de la part d'un cabinet pour prendre rendez-vous en ligne via le Booking Public (gynaeasy.com/booking). Les patients ne peuvent réserver que si ce code est valide, ce qui limite les abus extérieurs." 
                        />
                    </div>
                )
            },
            {
                id: "doc-billing",
                title: "Facturation & Inventaire",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400">Facturation & Stocks</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-2">Facturation (CCAM)</h3>
                                <p className="text-sm text-slate-300">Le médecin facture un usager en incluant des actes enregistrés dans le catalogue CCAM (Echographie, Biopsie, Consultation). Des règlements statuts (En attente, Partiel, Payé) suivent les transactions.</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-2">Inventaire</h3>
                                <p className="text-sm text-slate-300">Gestion des consommables. Lorsqu'un stock atteint la limite d'alerte configurée, une notification est propulsée sur le tableau de bord.</p>
                            </div>
                        </div>
                    </div>
                )
            }
        ]
    },
    {
        category: "Rôle : Secrétaire",
        icon: <User className="h-4 w-4 text-emerald-400" />,
        items: [
            {
                id: "sec-overview",
                title: "Périmètre de la Secrétaire",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-emerald-400">Accès Restreints (Secrétariat)</h2>
                        <p className="text-slate-300">
                            La secrétaire possède une vue limitée de la plateforme pour des raisons de confidentialité médicale.
                        </p>
                        <h3 className="text-lg font-semibold text-white mt-4 border-b border-white/10 pb-2">Modules Autorisés :</h3>
                        <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                            <li><strong>Agenda :</strong> Gérer les rendez-vous, ajouter des patients à l'emploi du temps, approuver des demandes de réservation.</li>
                            <li><strong>Facturation :</strong> Enregistrer des paiements, confirmer l'encaissement d'une consultation.</li>
                            <li><strong>Inventaire :</strong> Mettre à jour les stocks de matériel stérile ou consommables.</li>
                        </ul>
                        <Alert 
                            title="Confidentialité (Secret Médical)" 
                            desc="Les secrétaires N'ONT PAS accès au module Patients, et ne peuvent ni lire, ni éditer le dossier médical ou les historiques de consultations."
                        />
                    </div>
                )
            }
        ]
    },
    {
        category: "Rôle : Super Administrateur",
        icon: <Shield className="h-4 w-4 text-violet-400" />,
        items: [
            {
                id: "sa-overview",
                title: "Portail & Validations",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-violet-400">Gestion Globale & Sécurité</h2>
                        <p className="text-slate-300">
                            Le Super Admin contrôle l'application entière, gère les flux de paiement et sécurise la plateforme.
                        </p>
                        <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl mt-4">
                            <h3 className="text-lg font-bold text-white mb-2">Aprobations (Onboarding)</h3>
                            <p className="text-sm text-slate-300">Quand un médecin s'inscrit, il est mis en statut "EN_ATTENTE". Le SA doit examiner ses références (Ordre des médecins). S'il est validé sur le portail, un email automatique généré avec ses identifiants temporaires lui est envoyé.</p>
                        </div>
                    </div>
                )
            },
            {
                id: "sa-crm",
                title: "Abonnements & CRM",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-violet-400">Moteur SaaS (CRM)</h2>
                        <ul className="list-none space-y-4 text-slate-300 mt-2">
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                                <div>
                                    <strong className="text-white block mb-1">Supervision des Abonnements</strong>
                                    Le SA modifie les statuts (ACTIF, EXPIRE, ANNULE). Le chiffre d'affaires récurrent mensuel (MRR) est calculé sur cette base avec une visibilité sur les dates d'inscription.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                                <div>
                                    <strong className="text-white block mb-1">Promotions & Campagnes Pubs</strong>
                                    Le module Promotions permet d'offrir des mois gratuits. Le module Campagnes Ads insère un espace publicitaire (Partenaires Pharmaceutiques par ex) dans l'interface du médecin (Onglet Abonnement).
                                </div>
                            </li>
                        </ul>
                    </div>
                )
            },
            {
                id: "sa-ccam",
                title: "Catalogue CCAM",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-violet-400">Catalogue CCAM Régional</h2>
                        <p className="text-slate-300">
                            Le SA maintient le "dictionnaire" officiel des actes. Il active/désactive certains actes, gère la modification des prix conseillés ou des nouveaux codes mis en place par la régulation sanitaire régionale. C'est une page dotée d'une recherche performante indexée.
                        </p>
                    </div>
                )
            }
        ]
    }
];

// Helper Alert component
function Alert({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <h4 className="flex items-center gap-2 font-bold text-orange-400 text-sm mb-1">
                <Shield className="h-4 w-4" /> {title}
            </h4>
            <p className="text-xs text-orange-300/80">{desc}</p>
        </div>
    )
}

export default function SuperAdminDocu() {
    const [activeId, setActiveId] = useState<string>("intro");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    let activeContent = DOCS[0].items[0].content;
    let titlePath = "Introduction";

    for (const group of DOCS) {
        for (const item of group.items) {
            if (item.id === activeId) {
                activeContent = item.content;
                titlePath = `${group.category} / ${item.title}`;
            }
        }
    }

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
            {/* Mobile Toggle */}
            <button 
                className="md:hidden flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="h-5 w-5" />
                <span className="font-semibold text-sm">Sommaire</span>
            </button>

            {/* Sidebar TOC */}
            <div className={`
                fixed inset-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-sm md:static md:block md:w-64 md:bg-transparent md:z-auto transition-all duration-300
                ${isSidebarOpen ? "block" : "hidden"}
            `}>
                <div className="bg-[#0d1526] md:bg-white/5 border border-white/10 md:rounded-xl h-full w-3/4 md:w-full max-w-sm flex flex-col relative shadow-2xl md:shadow-none">
                    
                    {/* Mobile close */}
                    <button 
                        className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-2 text-violet-400">
                            <BookOpen className="h-5 w-5" />
                            <h2 className="font-bold text-white">Manuel Admin</h2>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-6">
                        {DOCS.map((group, idx) => (
                            <div key={idx} className="space-y-1">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2 px-2">
                                    {group.icon}
                                    {group.category}
                                </h3>
                                <ul>
                                    {group.items.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => {
                                                    setActiveId(item.id);
                                                    setIsSidebarOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                                                    activeId === item.id 
                                                        ? "bg-violet-500/20 text-violet-300 font-semibold" 
                                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                                }`}
                                            >
                                                <FileText className="h-3.5 w-3.5" />
                                                <span className="truncate">{item.title}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-[#0d1526]/50 border border-white/10 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-12 border-b border-white/5 flex items-center px-6 text-sm flex-shrink-0">
                    <span className="text-slate-500">Documentation</span>
                    <ChevronRight className="h-3 w-3 text-slate-600 mx-2" />
                    <span className="text-slate-300">{titlePath}</span>
                </div>
                <div className="p-6 md:p-10 flex-1 overflow-y-auto prose prose-invert prose-violet max-w-none">
                    <div className="max-w-3xl anim-fade-in">
                        {activeContent}
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .anim-fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
