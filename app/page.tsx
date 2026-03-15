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
    HeartPulse
} from 'lucide-react';
import Image from 'next/image';

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
                <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-10">
                    <Image
                        src="/medical_hero_bg_1773342439073.png"
                        alt="Background"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200/40 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-pink-100/40 rounded-full blur-[120px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-100 text-violet-600 text-xs font-black tracking-widest uppercase">
                            <Zap className="h-3.5 w-3.5" />
                            L'IA au service de la gynécologie
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-slate-900">
                            Digitalisez votre <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-pink-500">expertise médicale</span> en un clic.
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

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Calendar,
                                title: "Agenda Dynamique",
                                desc: "Gérez vos consultations, échographies et urgences avec une vue claire et des rappels SMS automatiques.",
                                color: "bg-violet-500"
                            },
                            {
                                icon: Smartphone,
                                title: "Multi-Support",
                                desc: "Accédez à votre dossier patient sur ordinateur, tablette ou mobile, où que vous soyez.",
                                color: "bg-pink-500"
                            },
                            {
                                icon: TrendingUp,
                                title: "Statistiques & Finance",
                                desc: "Visualisez en temps réel l'activité de votre cabinet et exportez vos bilans comptables.",
                                color: "bg-emerald-500"
                            }
                        ].map((f, i) => (
                            <div key={i} className="group p-8 bg-white rounded-3xl border border-slate-100 hover:border-violet-200 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className={`h-14 w-14 rounded-2xl ${f.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-${f.color.split('-')[1]}-500/20`}>
                                    <f.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
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
                            <li><a href="#" className="hover:text-violet-600 transition-colors">Centre d'aide</a></li>
                            <li><a href="#" className="hover:text-violet-600 transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-violet-600 transition-colors">Confidentialité</a></li>
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
