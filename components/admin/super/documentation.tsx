"use client";

import { useState } from "react";
import { BookOpen, FileText, ChevronRight, Menu, X, Shield, User, HeartPulse } from "lucide-react";

const DOCS = [
    {
        category: "Introduction & Architecture",
        items: [
            {
                id: "intro",
                title: "Vue d'ensemble et Stack Technique",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Introduction à Gynaeasy</h2>
                        
                        <div className="bg-gradient-to-br from-violet-500/10 to-pink-500/5 p-5 rounded-xl border border-violet-500/20 mb-6">
                            <h3 className="text-lg font-bold text-violet-300 mb-2">Architecture et Sécurité</h3>
                            <p className="text-sm text-slate-300 mb-4">
                                L'application est construite sur une stack technique moderne et robuste pour assurer des performances élevées et une sécurité rigoureuse des données médicales.
                            </p>
                            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
                                <li><strong>Frontend & Backend :</strong> Next.js 14+ (App Router) avec Server Actions pour la sécurité des mutations de données.</li>
                                <li><strong>Base de données :</strong> PostgreSQL hébergée sur Neon (Serverless), avec l'ORM Prisma.</li>
                                <li><strong>Authentification :</strong> NextAuth.js avec cryptage Bcrypt pour les mots de passe.</li>
                                <li><strong>Notifications :</strong> Intégration Twilio pour l'envoi de SMS (rappel de RDV) et Resend pour les emails (Onboarding).</li>
                            </ul>
                        </div>

                        <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">Philosophie de l'application</h3>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            Gynaeasy est un logiciel SaaS multi-tenant. Chaque médecin ("Cabinet") dispose de son propre environnement de données (Patients, Rendez-vous, Factures) totalement isolé des autres grâce à un filtrage strict par `userId` au niveau de la base de données.
                            <br/><br/>
                            Le Super Administrateur (vous) a pour rôle de superviser cette infrastructure, valider les nouveaux médecins pour éviter les fraudes, et gérer la partie commerciale (Abonnements, CRM, Publicités).
                        </p>
                    </div>
                )
            }
        ]
    },
    {
        category: "Interface Médecin",
        icon: <HeartPulse className="h-4 w-4 text-pink-400" />,
        items: [
            {
                id: "doc-dashboard",
                title: "Tableau de Bord & Alertes",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400 mb-4 border-b border-white/10 pb-4">Tableau de Bord & Statistiques</h2>
                        <p className="text-slate-300 text-sm">
                            Dès la connexion, le médecin arrive sur un tableau de bord calculé dynamiquement en lisant exclusivement les données qui lui appartiennent. Ce mur d'informations sert à piloter sa journée.
                        </p>
                        
                        <div className="space-y-4 mt-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="font-bold text-white text-md mb-2">Les KPIs (Indicateurs Clés)</h3>
                                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                    <li><strong>Total Patients :</strong> Calculé via un `count` sur la table Patient.</li>
                                    <li><strong>Consultations du Jour :</strong> Nombre de RDV filtrés sur la date du jour (via date-fns `isSameDay`).</li>
                                    <li><strong>Grossesses suivies :</strong> Nombre de patientes dont le statut interne indique une grossesse active.</li>
                                    <li><strong>Revenu du Jour :</strong> Somme totale des factures (ou règlements) enregistrés depuis 00h00.</li>
                                </ul>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="font-bold text-white text-md mb-2">Centre d'Alertes Moteur</h3>
                                <p className="text-sm text-slate-300 mb-2">Le composant `AlertsList` interroge la base de données pour détecter des situations critiques :</p>
                                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                    <li>Un stock d'inventaire est tombé sous le seuil d'alerte configuré.</li>
                                    <li>Le système de facturation détecte un paiement partiel ou en retard.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )
            },
            {
                id: "doc-patients",
                title: "Dossier Médical (JSON)",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400 mb-4 border-b border-white/10 pb-4">Dossier Médical & Architecture</h2>
                        <p className="text-slate-300 text-sm">
                            La force de Gynaeasy réside dans son adaptabilité. Chaque consultation est rattachée à un patient et stocke les données cliniques dans un format JSON dynamique.
                        </p>
                        
                        <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Composants de la Fiche Patient</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                                <div><strong>Données de base :</strong> Nom, Âge, Groupe sanguin (Rhésus), Téléphone. Ces données sont cryptées en base.</div>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                                <div><strong>Historique des Consultation :</strong> Un affichage sous forme de 'Timeline' affiche l'historique chronologique des visites.</div>
                            </li>
                            <li className="flex gap-3">
                                <div className="mt-1 h-2 w-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                                <div><strong>Flexibilité JSON (donneesMedicales) :</strong> Prises de tensions, DDR (Date des Dernières Règles), observations cliniques ou prescriptions, tout est stocké dans un champ `JSON` Prisma permettant au médecin d'ajouter autant de métadonnées que souhaité sans limiter la base de données.</div>
                            </li>
                        </ul>

                        <Alert 
                            title="Génération PDF (Ordonnances)" 
                            desc="Le médecin peut rédiger une ordonnance depuis l'interface patient. En cliquant sur imprimer, le composant @react-pdf/renderer génère à la volée un document PDF formaté avec l'en-tête du cabinet, prêt à être tendu au patient." 
                        />
                    </div>
                )
            },
            {
                id: "doc-agenda",
                title: "Prise de RDV Publique",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-pink-400 mb-4 border-b border-white/10 pb-4">Agenda & Système de Booking</h2>
                        <p className="text-slate-300 text-sm mb-4">
                            L'agenda permet de gérer l'emploi du temps du cabinet (ou de la clinique). La grande particularité est le portail public de réservation en ligne pour les patients.
                        </p>

                        <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700">
                            <h3 className="font-bold text-white mb-2">Le Flux de Réservation Public (gynaeasy.com/booking)</h3>
                            <ol className="list-decimal list-inside space-y-3 text-sm text-slate-300">
                                <li>Le patient se rend sur la page de Booking.</li>
                                <li>Il entre un <strong>Code Patient Unique (5 chiffres)</strong>. Ce code lui est remis physiquement au cabinet ou par SMS lors de sa création. C'est une mesure anti-spam essentielle.</li>
                                <li>Le serveur (`validatePatientCode`) vérifie si le code correspond à un patient existant dans la base de données.</li>
                                <li>Le patient sélectionne le médecin, le jour et un créneau horaire disponible.</li>
                                <li>Le statut de la consultation passe en `EN_ATTENTE`. Le médecin ou la secrétaire devra l'approuver ou l'annuler depuis son dashboard.</li>
                            </ol>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-200 mt-6 mb-2">Rappels SMS automatiques</h3>
                        <p className="text-slate-300 text-sm">
                            Le système est relié à l'API Twilio. Un `cron job` vérifie les consultations confirmées 24h à l'avance et déclenche un SMS de rappel sur le téléphone du patient pour réduire le taux d'absentéisme (No-show). Le champ `smsReminded` bascule alors sur `true` pour éviter les doublons.
                        </p>
                    </div>
                )
            }
        ]
    },
    {
        category: "Interface Secrétaire",
        icon: <User className="h-4 w-4 text-emerald-400" />,
        items: [
            {
                id: "sec-overview",
                title: "Création et Permissions",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-emerald-400 mb-4 border-b border-white/10 pb-4">Périmètre de la Secrétaire</h2>
                        
                        <p className="text-slate-300 text-sm mb-4">
                            Les secrétaires sont créées <strong>exclusivement</strong> par le Médecin via son onglet Paramètres. Elles n'ont pas accès au portail public d'inscription.
                        </p>

                        <h3 className="text-lg font-semibold text-white mt-4">La muraille de la confidentialité</h3>
                        <p className="text-slate-300 text-sm">
                            Le Middleware et les Server Actions de Next.js empêchent strictement tout compte de type `SECRETAIRE` d'accéder aux routes `/patients`, `/statistiques` ou `/abonnement`. Si une secrétaire tente d'entrer l'URL `/patients/xxx` à la main, elle sera bloquée et redirigée.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h4 className="font-bold text-emerald-400 mb-2">Actions Autorisées</h4>
                                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                    <li>Lire / Ajouter / Déplacer un rendez-vous (Agenda).</li>
                                    <li>Générer une facture et l'encaisser en espèce ou carte bancaire.</li>
                                    <li>Décrémenter ou incrémenter les stocks de matériel (Inventaire).</li>
                                </ul>
                            </div>
                            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                                <h4 className="font-bold text-red-400 mb-2">Actions Interdites</h4>
                                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                    <li>Ouvrir le Dossier Médical JSON.</li>
                                    <li>Lire les prescriptions passées, le motif intime du rendez-vous, ou rédiger une ordonnance.</li>
                                    <li>Accéder au module comptabilité/statistiques du cabinet.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )
            }
        ]
    },
    {
        category: "Module Super Admin",
        icon: <Shield className="h-4 w-4 text-violet-400" />,
        items: [
            {
                id: "sa-overview",
                title: "Onboarding & Validation",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-violet-400 mb-4 border-b border-white/10 pb-4">Validation des Nouveaux Inscrits</h2>
                        
                        <p className="text-slate-300 text-sm">
                            Gynaeasy étant un outil professionnel sensible, la création de compte médecin nécessite une approbation humaine pour éviter que n'importe qui accède à un logiciel prescripteur.
                        </p>

                        <div className="bg-[#1a2340] p-5 rounded-lg border border-[#2a3766] mt-4">
                            <h3 className="font-bold text-white mb-3">Le Flux d'Onboarding :</h3>
                            <ol className="list-decimal list-inside space-y-3 text-sm text-slate-300">
                                <li>Le médecin remplit le formulaire sur `/onboarding` (Nom, Clinique, N° Ordre des médecins).</li>
                                <li>La base de données enregistre l'utilisateur avec `role: "MEDECIN"` mais avec `enabledModules: []`, ce qui bloque la connexion.</li>
                                <li><strong>(Action du Super Admin) :</strong> Dans l'onglet `Validations`, vous vérifiez son identité. Vous cliquez sur "Valider".</li>
                                <li>Le compte est approuvé. Un mot de passe aléatoire hautement sécurisé est généré et hashé par Bcrypt en base de données.</li>
                                <li>Le service externe (Resend) envoie automatiquement un email professionnel au médecin contenant ses identifiants et un lien de connexion.</li>
                            </ol>
                        </div>
                    </div>
                )
            },
            {
                id: "sa-crm",
                title: "Gestion Financière (CRM)",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-violet-400 mb-4 border-b border-white/10 pb-4">Moteur Financier et Abonnements</h2>
                        <p className="text-slate-300 text-sm">
                            Le modèle économique est géré depuis l'onglet `Abonnements & CRM`. Vous attribuez les types de licences aux médecins actifs.
                        </p>

                        <h3 className="font-bold text-white mt-4 mb-2">Logique de calcul MRR (Revenu Récurrent Mensuel)</h3>
                        <p className="text-slate-300 text-sm mb-2">
                            Le chiffre généré en haut de la page est le MRR Net. Son algorithme est dynamique :
                        </p>
                        <div className="bg-black/30 font-mono text-xs text-green-400 p-4 rounded">
                            <p>PrixBase = (SOLO: 25k, PRO: 50k, CLINIQUE: 95k)</p>
                            <p>Si reductionType == "POURCENTAGE" {"=>"} PrixFinal = PrixBase * (1 - (valeur / 100))</p>
                            <p>Si reductionType == "MONTANT_FIXE" {"=>"} PrixFinal = PrixBase - valeur</p>
                            <p>TotalMRR = Somme(PrixFinal) pour tous les abonnements ACTIFS.</p>
                        </div>

                        <h3 className="font-bold text-white mt-6 mb-2">Campagnes Publicitaires (Ads)</h3>
                        <p className="text-slate-300 text-sm">
                            L'onglet `Campagnes Ads` permet de configurer des bannières sponsorisées par des partenaires (ex: Laboratoires).
                            <br/><br/>
                            Lorsqu'une publicité est configurée avec des dates de début et de fin, et un statut `PUBLISHED`, elle remplace dynamiquement l'encart publicitaire par défaut du menu `Abonnement` côté Médecin. Le Super Admin peut voir le prix total que l'annonceur devra payer (calcul automatique: budgetJournalier * nombre_de_jours).
                        </p>
                    </div>
                )
            },
            {
                id: "sa-ccam",
                title: "Catalogue CCAM",
                content: (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-violet-400 mb-4 border-b border-white/10 pb-4">Master Data : Classification Commune des Actes Médicaux</h2>
                        <p className="text-slate-300 text-sm">
                            La nomenclature CCAM constitue la colonne vertébrale du module de facturation pour tous les cliniciens.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 mt-4">
                            <li><strong>Centralisation :</strong> Plutôt que chaque médecin crée ses actes, les tarifs de base et les libellés (échographie, stérilet, etc.) sont propagés depuis le compte Super Admin vers toutes les factures.</li>
                            <li><strong>Désactivation :</strong> Si un acte est obsolète, le Super Admin le désactive. Il n'apparaîtra plus dans les menus déroulants des médecins, mais restera intact dans l'historique des anciennes factures pour garantir l'intégrité comptable.</li>
                            <li><strong>Fast-Search :</strong> La page est équipée d'un système de recherche client super-rapide et paginé par lot de 15 éléments pour une navigation efficace même avec des centaines d'actes en base.</li>
                        </ul>
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
