"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    HelpCircle, 
    Search, 
    ChevronRight, 
    BookOpen, 
    MessageSquare, 
    PlayCircle, 
    Calendar, 
    Stethoscope, 
    Settings, 
    ShieldCheck, 
    Microscope, 
    CreditCard 
} from "lucide-react";

export default function AidePage() {
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        { title: "Prise en main", icon: <PlayCircle className="h-6 w-6" />, count: 12, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Dossier Médical", icon: <Stethoscope className="h-6 w-6" />, count: 24, color: "text-pink-600", bg: "bg-pink-50" },
        { title: "Facturation & CCAM", icon: <CreditCard className="h-6 w-6" />, count: 15, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Imagerie & Echo", icon: <Microscope className="h-6 w-6" />, count: 8, color: "text-violet-600", bg: "bg-violet-50" },
        { title: "Agenda & RDV", icon: <Calendar className="h-6 w-6" />, count: 18, color: "text-orange-600", bg: "bg-orange-50" },
        { title: "Configuration", icon: <Settings className="h-6 w-6" />, count: 10, color: "text-slate-600", bg: "bg-slate-50" },
    ];

    const faqs = [
        { 
            q: "Comment activer le module d'urgence pour mon cabinet ?", 
            a: "Allez dans Paramètres > Ma Clinique, et activez l'interrupteur 'Disponibilité Urgence'. Vous apparaîtrez alors dans la section Urgence du portail patient." 
        },
        { 
            q: "Puis-je importer ma base de données patients depuis un autre logiciel ?", 
            a: "Oui, Gynaeasy supporte l'import via fichiers Excel/CSV. Contactez notre support technique pour un accompagnement personnalisé." 
        },
        { 
            q: "Mes données sont-elles hébergées sur des serveurs HDS ?", 
            a: "Absolument. Gynaeasy utilise des serveurs certifiés Hébergement de Données de Santé (HDS) pour garantir une sécurité maximale." 
        },
        { 
            q: "Comment gérer les droits d'accès de ma secrétaire ?", 
            a: "Dans la gestion des utilisateurs, vous pouvez définir le rôle 'Secrétaire' qui limite l'accès aux dossiers médicaux sensibles tout en permettant la gestion de l'agenda." 
        },
    ];

    const filteredCategories = categories.filter(cat => 
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredFaqs = faqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    );


    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-violet-950 to-pink-950 rounded-[3rem] p-16 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest text-pink-300 mb-6">
                        <ShieldCheck className="h-3 w-3" /> Support Prioritaire HDS
                    </div>
                    <h1 className="text-5xl font-black tracking-tight mb-6">Comment pouvons-nous vous aider ?</h1>
                    <p className="text-xl text-slate-300 font-medium mb-10 leading-relaxed">Explorez nos guides détaillés ou recherchez une solution spécifique pour optimiser la gestion de votre cabinet.</p>
                    
                    <div className="relative group/search">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-focus-within/search:text-pink-500 transition-colors" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une fonctionnalité, un guide, ou un code CCAM..." 
                            className="w-full bg-white rounded-3xl py-6 pl-14 pr-6 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-pink-500/20 shadow-xl transition-all text-lg font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* No results message */}
            {filteredCategories.length === 0 && filteredFaqs.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Search className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Aucun résultat trouvé</h3>
                    <p className="text-slate-500 font-medium">Essayez d'autres mots-clés ou parcourez nos catégories.</p>
                </div>
            )}

            {/* Categories Grid */}
            {filteredCategories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                    {filteredCategories.map((cat, i) => (
                        <button key={i} className="p-10 bg-white border border-slate-100 rounded-[2.5rem] text-left hover:shadow-2xl hover:border-pink-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 -mr-16 -mt-16 rounded-full group-hover:bg-pink-50 transition-colors" />
                            <div className={`h-16 w-16 rounded-2xl ${cat.bg} flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform mb-8 border border-white shadow-sm relative z-10`}>
                                {cat.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-3 relative z-10">{cat.title}</h3>
                            <p className="text-slate-500 font-medium mb-6 relative z-10">{cat.count} articles et tutoriels vidéo</p>
                            <div className="flex items-center text-sm font-black text-pink-600 uppercase tracking-widest gap-2 group-hover:gap-4 transition-all">
                                Explorer <ChevronRight className="h-4 w-4" />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* FAQ Section */}
            {filteredFaqs.length > 0 && (
                <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
                                <HelpCircle className="h-8 w-8 text-pink-600" />
                                {searchQuery ? "Résultats dans la FAQ" : "Questions Fréquentes"}
                            </h2>
                            <p className="text-slate-500 font-medium">Les réponses rapides aux questions de nos praticiens.</p>
                        </div>
                        {!searchQuery && (
                            <button className="px-8 py-4 bg-slate-50 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">
                                Voir toute la FAQ
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredFaqs.map((faq, i) => (
                            <div key={i} className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 hover:border-pink-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                                <h4 className="font-bold text-lg text-slate-900 mb-4 group-hover:text-pink-700 transition-colors leading-snug">{faq.q}</h4>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Need More Help? */}
            <div className="bg-pink-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div>
                    <h3 className="text-2xl font-black mb-2">Vous n'avez pas trouvé votre bonheur ?</h3>
                    <p className="text-pink-100 font-medium opacity-90">Notre équipe de support est disponible 24/7 pour vous accompagner.</p>
                </div>
                <Link 
                    href="/contact"
                    className="px-10 py-5 bg-white text-pink-600 font-black rounded-2xl hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap"
                >
                    Contacter le support
                </Link>
            </div>
        </div>
    );
}
