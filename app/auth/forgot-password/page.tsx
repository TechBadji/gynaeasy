"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/reset-password";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const result = await requestPasswordReset(email);
            if (!result.success) {
                if (result.error === "EMAIL_NOT_FOUND") {
                    setError("Aucun compte ne correspond à cette adresse email. Vérifiez l'adresse ou contactez votre administrateur.");
                } else {
                    setError("Une erreur est survenue. Veuillez réessayer.");
                }
            } else {
                setSent(true);
            }
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-violet-600">
                    <Activity className="h-12 w-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    Mot de passe oublié
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Saisissez votre email pour recevoir un lien de réinitialisation
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
                    {sent ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-sm text-slate-700 mb-4">
                                Un email avec les instructions de réinitialisation a été envoyé à <b>{email}</b>. Vérifiez également vos spams.
                            </p>
                            <Link href="/auth/login" className="text-violet-600 hover:text-violet-500 text-sm font-medium">
                                ← Retour à la connexion
                            </Link>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
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
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50"
                                >
                                    {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                                </button>
                            </div>
                            <div className="text-center">
                                <Link href="/auth/login" className="text-sm text-violet-600 hover:text-violet-500">
                                    ← Retour à la connexion
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
