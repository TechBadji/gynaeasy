import Link from 'next/link';
import {
    Activity,
    Calendar,
    Shield,
    Users,
    Zap,
    CheckCircle2,
    PlusCircle,
    Smartphone,
    TrendingUp,
    HeartPulse,
    FileText,
    Video,
    Bell,
    Microscope,
    CreditCard,
    Brain,
    ShieldCheck,
    Stethoscope,
    Baby,
    UserCircle
} from 'lucide-react';
import Image from 'next/image';
import { SUBSCRIPTION_PLANS } from '@/config/plans';
import { formatFCFA } from '@/lib/subscriptions';

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-violet-100 selection:text-violet-600">
            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-slate-900">Gynaeasy</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors">Fonctionnalités</a>
                        <a href="#pricing" className="text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors">Tarifs</a>
                        <a href="#specialists" className="text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors">Spécialistes</a>
                        <Link href="/auth/login" className="text-sm font-semibold text-slate-900 hover:text-violet-600 transition-colors">Connexion</Link>
                        <Link
                            href="/onboarding"
                            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95"
                        >
                            Pour les Médecins
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -z-10 w-full lg:w-3/5 h-full opacity-30 lg:opacity-70">
                    <Image
                        src="/hero-background.png"
                        alt="Background Gynaeasy"
                        fill
                        className="object-cover mask-gradient-to-l"
                        priority
                        unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:block hidden" />
                </div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-pink-100/40 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-black tracking-widest uppercase">
                            <Zap className="h-3.5 w-3.5" />
                            L'IA au service de la gynécologie
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1] text-slate-900">
                            Digitalisez votre <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-500 underline decoration-pink-500/20">vision médicale</span>.
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            La plateforme SaaS tout-en-un pour les gynécologues, obstétriciens et échographistes africains. Gérez vos rendez-vous, dossiers patients et facturation avec une simplicité déconcertante.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link
                                href="/onboarding"
                                className="w-full sm:w-auto px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 group active:scale-95"
                            >
                                Inscrire mon cabinet
                                <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            </Link>
                            <Link
                                href="/booking"
                                className="w-full sm:w-auto px-8 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                            >
                                <Calendar className="h-5 w-5 text-violet-600" />
                                Prendre rendez-vous
                            </Link>
                        </div>

                        <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                            <div className="flex items-center gap-2 font-bold text-slate-400">
                                <Shield className="h-5 w-5" /> 100% Sécurisé HDS
                            </div>
                            <div className="flex items-center gap-2 font-bold text-slate-400">
                                <Users className="h-5 w-5" /> +200 Médecins
                            </div>
                        </div>
                    </div>

                    {/* App Mockup Preview */}
                    <div className="relative lg:block hidden">
                        <div className="relative bg-slate-100 rounded-[3rem] p-4 shadow-2xl overflow-hidden border-8 border-white">
                            <div className="bg-white rounded-[2rem] h-[580px] w-full overflow-hidden shadow-inner">
                                {/* Simulating app mockup layout */}
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 w-32 bg-slate-100 rounded-full" />
                                        <div className="h-10 w-10 bg-violet-600 rounded-xl" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100" />
                                        <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100" />
                                    </div>
                                    <div className="h-64 bg-slate-50 rounded-2xl border border-slate-100 p-4">
                                        <div className="space-y-3">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-10 w-full bg-white rounded-lg border border-slate-100" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -left-10 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                    <HeartPulse className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Suivi Grossesse</p>
                                    <p className="text-[10px] text-slate-400">Activé en temps réel</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-4xl font-black tracking-tight text-slate-900">Tout ce dont votre cabinet à besoin.</h2>
                        <p className="text-lg text-slate-500">
                            Une interface pensée par des médecins pour des médecins africains. Rapide, fluide et sans complexité inutile.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: FileText,
                                title: "Dossier Médical Spécialisé",
                                desc: "Dossiers patients pensés pour la gynécologie-obstétrique : suivi de grossesse, fiches d'échographie et historique vaccinal.",
                                color: "bg-violet-600",
                                shadow: "shadow-violet-200"
                            },
                            {
                                icon: Video,
                                title: "Téléconsultation Sécurisée",
                                desc: "Réalisez des consultations à distance via notre canal vidéo HD chiffré, conforme aux normes de santé.",
                                color: "bg-pink-600",
                                shadow: "shadow-pink-200"
                            },
                            {
                                icon: Brain,
                                title: "IA & Aide au Diagnostic",
                                desc: "Gagnez du temps avec la génération automatique de comptes-rendus et l'analyse intelligente des données cliniques.",
                                color: "bg-indigo-600",
                                shadow: "shadow-indigo-200"
                            },
                            {
                                icon: Bell,
                                title: "Rappels & Notifications",
                                desc: "Réduisez les rendez-vous manqués de 40% grâce aux rappels SMS et WhatsApp envoyés automatiquement à vos patientes.",
                                color: "bg-amber-500",
                                shadow: "shadow-amber-200"
                            },
                            {
                                icon: Microscope,
                                title: "Gestion Labo & Imagerie",
                                desc: "Centralisez tous les examens biologiques et les clichés d'imagerie directement dans la fiche de votre patiente.",
                                color: "bg-emerald-600",
                                shadow: "shadow-emerald-200"
                            },
                            {
                                icon: CreditCard,
                                title: "Facturation & Comptabilité",
                                desc: "Suivez vos revenus en temps réel, gérez les paiements mobiles (Orange Money, Wave) et exportez vos bilans.",
                                color: "bg-sky-600",
                                shadow: "shadow-sky-200"
                            }
                        ].map((f, i) => (
                            <div key={i} className="group p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-violet-200 transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-all group-hover:bg-violet-50/50" />
                                <div className={`relative h-14 w-14 rounded-2xl ${f.color} flex items-center justify-center text-white mb-8 shadow-xl ${f.shadow}`}>
                                    <f.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900 group-hover:text-violet-600 transition-colors">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* --- TRUST & SECURITY SECTION --- */}
            <section className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-violet-100 rounded-full blur-3xl opacity-50" />
                            <div className="relative bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl transform -rotate-2">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-violet-500 flex items-center justify-center">
                                            <ShieldCheck className="h-6 w-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">Données Sécurisées</h3>
                                    </div>
                                    <p className="text-slate-400 leading-relaxed font-medium">
                                        Vos données de santé sont chiffrées de bout en bout et hébergées sur des serveurs certifiés HDS (Hébergeur de Données de Santé).
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-violet-400 font-bold mb-1">A2F</p>
                                            <p className="text-xs text-slate-500">Double authentification</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                            <p className="text-pink-400 font-bold mb-1">Backup</p>
                                            <p className="text-xs text-slate-500">Sauvegarde automatique</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Badge */}
                            <div className="absolute -bottom-6 -right-6 bg-emerald-500 text-white p-6 rounded-3xl shadow-xl flex items-center gap-3 animate-pulse">
                                <CheckCircle2 className="h-6 w-6" />
                                <span className="font-bold">Conforme RGPD</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-black tracking-widest uppercase">
                                Pourquoi nous choisir ?
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                                Conçu pour la sérénité du <span className="text-violet-600">praticien</span>.
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Gynaeasy n'est pas juste un logiciel, c'est un assistant qui s'occupe de la logistique pendant que vous vous concentrez sur vos patientes.
                            </p>
                            
                            <ul className="space-y-6">
                                {[
                                    { title: "Zéro Installation", desc: "Pas de serveur à gérer. Accédez à votre cabinet via un simple navigateur." },
                                    { title: "Migration Facile", desc: "Nous importons gratuitement vos dossiers patients existants depuis votre ancien logiciel." },
                                    { title: "Support Premium 24/7", desc: "Une équipe dédiée pour vous accompagner par téléphone ou WhatsApp à tout moment." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                            <div className="h-2 w-2 rounded-full bg-violet-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SPECIALISTS SECTION --- */}
            <section id="specialists" className="py-24 bg-slate-900 overflow-hidden relative">
                {/* Patterns */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-widest uppercase">
                            Spécialités
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Une solution pour chaque <span className="text-violet-400">praticien</span> de la femme.</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Stethoscope,
                                name: "Gynécologues",
                                desc: "Suivi pathologique complet, gestion des frottis et dépistages.",
                                accent: "border-violet-500/50"
                            },
                            {
                                icon: Baby,
                                name: "Obstétriciens",
                                desc: "Surveillance de grossesse à haut risque et gestion des accouchements.",
                                accent: "border-pink-500/50"
                            },
                            {
                                icon: Activity,
                                name: "Échographistes",
                                desc: "Édition rapide de comptes-rendus d'échographie morphologique.",
                                accent: "border-emerald-500/50"
                            },
                            {
                                icon: UserCircle,
                                name: "Sages-femmes",
                                desc: "Suivi de grossesse physiologique et conseils post-partum.",
                                accent: "border-amber-500/50"
                            }
                        ].map((spec, i) => (
                            <div key={i} className={`group bg-white/5 backdrop-blur-sm border-2 ${spec.accent} p-8 rounded-[2.5rem] hover:bg-white/10 transition-all cursor-default overflow-hidden relative`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <spec.icon className="h-24 w-24 text-white" />
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                    <spec.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{spec.name}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {spec.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PRICING SECTION --- */}
            <section id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black tracking-widest uppercase">
                            Tarification
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-slate-900">Une offre adaptée à chaque structure.</h2>
                        <p className="text-lg text-slate-500">
                            Digitalisez votre cabinet sans compromis. Des tarifs clairs, sans frais d'installation.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <div key={plan.id} className={`relative flex flex-col p-8 bg-white rounded-[2.5rem] border ${plan.isPopular ? 'border-violet-200 shadow-2xl scale-105 z-10' : 'border-slate-100 shadow-sm'} transition-all hover:shadow-xl`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Le plus populaire
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    <p className="text-sm text-slate-500 mt-2 min-h-[40px] leading-relaxed">{plan.description}</p>
                                </div>
                                <div className="mb-8 p-6 bg-slate-50 rounded-3xl">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900">{formatFCFA(plan.price)}</span>
                                        <span className="text-slate-400 text-sm font-medium">/{plan.period}</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-slate-600' : 'text-slate-400/60'}`}>
                                            <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${feature.included ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            </div>
                                            <span className={feature.included ? 'font-medium' : 'line-through decoration-slate-300'}>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/onboarding?plan=${plan.id}`}
                                    className={`w-full py-5 rounded-2xl font-black text-sm transition-all text-center active:scale-95 ${
                                        plan.isPopular 
                                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10' 
                                        : 'bg-white border-2 border-slate-100 text-slate-900 hover:border-violet-100 hover:bg-violet-50/30'
                                    }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SIGNUP CTA SECTION --- */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="bg-gradient-to-br from-violet-600 to-pink-500 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden shadow-2xl shadow-violet-500/40">
                        {/* Patterns */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl" />

                        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                                Prêt à passer à la vitesse supérieure ?
                            </h2>
                            <p className="text-lg md:text-xl text-white/80 font-medium">
                                Inscrivez-vous aujourd'hui et recevez l'approbation de notre équipe administrative sous 24h.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="/onboarding"
                                    className="bg-white text-violet-600 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-xl active:scale-95"
                                >
                                    Rejoindre Gynaeasy
                                </Link>
                                <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
                                    <CheckCircle2 className="h-5 w-5" /> Essai gratuit 14 jours
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                                <Activity className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-black text-xl tracking-tighter text-slate-900">Gynaeasy</span>
                        </div>
                        <p className="text-slate-400 max-w-xs font-medium">
                            La première solution SaaS médicale pensée exclusivement pour la santé de la femme en Afrique.
                        </p>
                        <div className="flex gap-4">
                            {/* Socials can go here */}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold text-slate-900">Plateforme</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium">
                            <li><Link href="/onboarding" className="hover:text-violet-600 transition-colors">Portail Médecins</Link></li>
                            <li><Link href="/booking" className="hover:text-violet-600 transition-colors">Portail Patients</Link></li>
                            <li><Link href="/auth/login" className="hover:text-violet-600 transition-colors">Connexion</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold text-slate-900">Support</h4>
                        <ul className="space-y-4 text-slate-500 text-sm font-medium">
                            <li><Link href="/aide" className="hover:text-violet-600 transition-colors">Centre d'aide</Link></li>
                            <li><Link href="/contact" className="hover:text-violet-600 transition-colors">Contact</Link></li>
                            <li><Link href="/confidentialite" className="hover:text-violet-600 transition-colors">Confidentialité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-400 text-xs font-bold">
                        © 2026 Gynaeasy — Tous droits réservés.
                    </p>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                        Made with ❤️ for Senegal & Africa
                    </p>
                </div>
            </footer>
        </div>
    );
}
