"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [step, setStep] = useState<"credentials" | "totp">("credentials");

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Vérifier si l'utilisateur a la 2FA activée
            const check = await fetch(`/api/auth/check-2fa?email=${encodeURIComponent(email)}`);
            const { twoFactorEnabled } = await check.json();

            if (twoFactorEnabled) {
                // Passer à l'étape de saisie du code TOTP
                setStep("totp");
                setIsLoading(false);
                return;
            }

            // Pas de 2FA : connexion directe
            await doSignIn();
        } catch (err: any) {
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
                email,
                password,
                twoFactorCode: totp || "",
                rememberMe: String(rememberMe),
                redirect: false,
                callbackUrl,
            });

            if (result?.error) {
                const msg = result.error === "CredentialsSignin"
                    ? (step === "totp" || totp ? "Code 2FA invalide ou identifiants incorrects" : "Identifiants incorrects")
                    : result.error;
                setError(msg);
            } else {
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err: any) {
            setError("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
            {/* Étape 1 : Email + Mot de passe */}
            {step === "credentials" && (
                <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Adresse Email
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                                placeholder="saisir votre email"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Mot de passe
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 pr-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-slate-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                                Se souvenir de moi
                            </label>
                        </div>
                        <div className="text-sm">
                            <Link href="/auth/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                        >
                            {isLoading ? "Vérification..." : "Se connecter"}
                        </button>
                    </div>
                </form>
            )}

            {/* Étape 2 : Code TOTP */}
            {step === "totp" && (
                <form className="space-y-6" onSubmit={handleTotpSubmit}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Double authentification</p>
                            <p className="text-xs text-slate-500">Ouvrez votre application d'authentification</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="totp" className="block text-sm font-medium text-slate-700">
                            Code à 6 chiffres
                        </label>
                        <div className="mt-1">
                            <input
                                id="totp"
                                name="totp"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9 ]*"
                                maxLength={7}
                                autoComplete="one-time-code"
                                autoFocus
                                required
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                placeholder="000000"
                            />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">Le code expire toutes les 30 secondes.</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setStep("credentials"); setError(""); setTwoFactorCode(""); }}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || twoFactorCode.length !== 6}
                            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                        >
                            {isLoading ? "Vérification..." : "Valider"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-pink-600">
                    <Activity className="h-12 w-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Gynaeasy
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Espace d&apos;authentification sécurisé
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense
                    fallback={
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 text-center text-slate-500">
                            Chargement...
                        </div>
                    }
                >
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
