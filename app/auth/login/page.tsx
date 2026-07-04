"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Activity, Eye, EyeOff, ShieldCheck, ArrowLeft,
    Calendar, Users, FileText, Lock, Stethoscope, Baby
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
    { icon: Calendar,     text: "Agenda & rendez-vous en temps réel" },
    { icon: Users,        text: "Dossiers patients sécurisés" },
    { icon: Stethoscope,  text: "Consultations & prescriptions" },
    { icon: Baby,         text: "Suivi de grossesse intégré" },
    { icon: FileText,     text: "Facturation & ordonnances PDF" },
];

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail]               = useState("");
    const [password, setPassword]         = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [error, setError]               = useState("");
    const [isLoading, setIsLoading]       = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe]     = useState(false);
    const [step, setStep]                 = useState<"credentials" | "totp">("credentials");

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const check = await fetch(`/api/auth/check-2fa?email=${encodeURIComponent(email)}`);
            const { twoFactorEnabled } = await check.json();
            if (twoFactorEnabled) {
                setStep("totp");
                setIsLoading(false);
                return;
            }
            await doSignIn();
        } catch {
            setError("Une erreur est survenue");
            setIsLoading(false);
        }
    };

    const handleTotpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        await doSignIn(twoFactorCode);
    };

    const doSignIn = async (totp?: string) => {
        try {
            const result = await signIn("credentials", {
                email, password,
                twoFactorCode: totp || "",
                rememberMe: String(rememberMe),
                redirect: false,
                callbackUrl,
            });
            if (result?.error) {
                const msg = result.error === "CredentialsSignin"
                    ? (step === "totp" || totp ? "Code 2FA invalide ou identifiants incorrects" : "Email ou mot de passe incorrect")
                    : result.error;
                setError(msg);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setError("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all";

    return (
        <>
            {/* Étape 1 : Identifiants */}
            {step === "credentials" && (
                <form className="space-y-5" onSubmit={handleCredentialsSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Adresse email
                        </label>
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass}
                            placeholder="vous@cabinet.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass} pr-12`}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <div
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${rememberMe ? "bg-violet-600 border-violet-600" : "border-slate-300 hover:border-violet-400"}`}
                            >
                                {rememberMe && (
                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-sm text-slate-600 font-medium select-none">Se souvenir de moi</span>
                        </label>
                        <Link href="/auth/forgot-password" className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors">
                            Mot de passe oublié ?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Vérification...
                            </>
                        ) : "Se connecter"}
                    </button>
                </form>
            )}

            {/* Étape 2 : TOTP */}
            {step === "totp" && (
                <form className="space-y-6" onSubmit={handleTotpSubmit}>
                    <div className="text-center space-y-3">
                        <div className="h-16 w-16 rounded-3xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto">
                            <ShieldCheck className="h-8 w-8 text-violet-600" />
                        </div>
                        <div>
                            <p className="font-black text-slate-900">Double authentification</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">Ouvrez votre application d'authentification et saisissez le code à 6 chiffres.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9 ]*"
                            maxLength={7}
                            autoComplete="one-time-code"
                            autoFocus
                            required
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 text-center text-3xl tracking-[0.5em] font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                            placeholder="000000"
                        />
                        <p className="text-center text-xs text-slate-400 font-medium">Le code expire toutes les 30 secondes</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setStep("credentials"); setError(""); setTwoFactorCode(""); }}
                            className="flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Retour
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || twoFactorCode.length !== 6}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? "Vérification..." : "Valider le code"}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex">
            {/* Panneau gauche — brand */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-900 via-violet-800 to-slate-900 relative overflow-hidden flex-col justify-between p-14">
                {/* Cercles décoratifs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

                {/* Logo */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">Gynaeasy</span>
                    </div>
                </div>

                {/* Texte central */}
                <div className="relative z-10 space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
                            Le logiciel<br />
                            <span className="text-violet-300">made for</span><br />
                            gynécologues.
                        </h1>
                        <p className="text-violet-300 font-medium leading-relaxed max-w-xs">
                            Gérez votre cabinet, vos patients et vos consultations depuis une seule interface.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {FEATURES.map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-4">
                                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                                    <Icon className="h-4 w-4 text-violet-300" />
                                </div>
                                <span className="text-sm font-medium text-white/80">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest">Données chiffrées AES-256 · Serveurs sécurisés</span>
                </div>
            </div>

            {/* Panneau droit — formulaire */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 bg-white">
                <div className="mx-auto w-full max-w-sm">
                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight">Gynaeasy</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Connexion</h2>
                        <p className="text-slate-500 font-medium mt-1.5">Bienvenue. Accédez à votre espace médical.</p>
                    </div>

                    <Suspense
                        fallback={
                            <div className="space-y-5 animate-pulse">
                                <div className="h-14 bg-slate-100 rounded-2xl" />
                                <div className="h-14 bg-slate-100 rounded-2xl" />
                                <div className="h-12 bg-violet-100 rounded-2xl" />
                            </div>
                        }
                    >
                        <LoginForm />
                    </Suspense>

                    <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                        Vous n&apos;avez pas de compte ?{" "}
                        <Link href="/#pricing" className="text-violet-600 font-bold hover:text-violet-700 transition-colors">
                            Découvrir les offres
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
