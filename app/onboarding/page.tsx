"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { registerDoctor } from "@/app/actions/onboarding";
import {
    Activity,
    User,
    Mail,
    Stethoscope,
    Building2,
    CheckCircle2,
    ChevronRight,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">Chargement...</div>}>
            <OnboardingForm />
        </Suspense>
    );
}

function OnboardingForm() {
    const searchParams = useSearchParams();
    const planFromUrl = searchParams.get("plan")?.toUpperCase() || "SOLO";
    
    const [isPending, startTransition] = useTransition();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        clinicName: "",
        specialite: "Gynécologue Obstétricienne"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                const res = await registerDoctor({
                    ...formData,
                    plan: planFromUrl as any
                });
                if (res.success) {
                    setIsSubmitted(true);
                    toast.success("Demande envoyée !");
                } else {
                    toast.error(res.error || "Une erreur est survenue.");
                }
            } catch (err: any) {
                toast.error("Échec de la connexion au serveur.");
            }
        });
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="h-24 w-24 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
                        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-black">Email de vérification envoyé !</h1>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            Merci Dr. {formData.name}. Nous venons de vous envoyer un email pour vérifier votre adresse.
                            Une fois vérifiée, votre dossier sera transmis à notre équipe administrative pour activation.
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link href="/" className="inline-flex items-center gap-2 text-violet-400 font-bold hover:text-violet-300 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col md:flex-row">
            {/* Left Side: Branding & Info */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-violet-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48 blur-3xl" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-16">
                        <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-white">Gynaeasy</span>
                    </Link>

                    <div className="space-y-12 max-w-md">
                        <h2 className="text-5xl font-black leading-tight">Rejoignez la révolution médicale.</h2>
                        <ul className="space-y-6">
                            {[
                                "Gestion complète du dossier patient",
                                "Agenda intelligent et rappels SMS",
                                "Facturation et rapports financiers",
                                "Sécurisation des données (HDS)"
                            ].map((text, i) => (
                                <li key={i} className="flex items-center gap-4 text-white/90 font-bold">
                                    <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="relative z-10">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                        Gynaeasy — Plateforme Médicale Panafricaine
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-8 md:p-12">
                <div className="max-w-md w-full space-y-10">
                    <div className="md:hidden flex justify-center mb-8">
                        <Activity className="h-10 w-10 text-violet-500" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-white">Inscrivez votre cabinet</h1>
                        <p className="text-slate-400 font-medium">Commencez votre digitalisation en quelques secondes.</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black tracking-widest uppercase mt-2">
                            Offre choisie : {planFromUrl}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nom Complet</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    required
                                    type="text"
                                    placeholder="ex: Dr. Anna Badji"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Adresse Email Professionnelle</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    required
                                    type="email"
                                    placeholder="ex: contact@cabinet-badji.sn"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nom du Cabinet / Clinique</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    required
                                    type="text"
                                    placeholder="ex: Gynaeasy Clinic"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                                    value={formData.clinicName}
                                    onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Spécialité</label>
                            <div className="relative">
                                <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white appearance-none focus:outline-none focus:border-violet-500 transition-all"
                                    value={formData.specialite}
                                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                                >
                                    <option className="bg-slate-900" value="Gynécologue Obstétricienne">Gynécologue Obstétricienne</option>
                                    <option className="bg-slate-900" value="Échographiste">Échographiste</option>
                                    <option className="bg-slate-900" value="Sage-femme">Sage-femme</option>
                                    <option className="bg-slate-900" value="Chirurgien Gynécologue">Chirurgien Gynécologue</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-violet-500/30 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
                        >
                            {isPending ? "Traitement..." : "Valider mon inscription"}
                            {!isPending && <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-sm font-medium">
                        Vous avez déjà un compte ? <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Se connecter</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
