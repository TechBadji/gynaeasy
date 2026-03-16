"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const errorMessages: Record<string, string> = {
        Configuration: "Il y a un problème avec la configuration du serveur (NEXTAUTH_SECRET ou NEXTAUTH_URL manquant).",
        AccessDenied: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
        Verification: "Le jeton de vérification a expiré ou a déjà été utilisé.",
        Default: "Une erreur inattendue est survenue lors de l'authentification."
    };

    const message = errorMessages[error as string] || errorMessages.Default;

    return (
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 text-center">
            <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur d&apos;authentification</h2>
            <p className="text-slate-600 mb-6">
                {message}
            </p>
            {error === "Configuration" && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6 text-left text-sm text-amber-800">
                    <p className="font-bold mb-1">💡 Solution :</p>
                    <p>Vérifiez que les variables <strong>NEXTAUTH_SECRET</strong> et <strong>NEXTAUTH_URL</strong> sont bien configurées dans votre tableau de bord Vercel.</p>
                </div>
            )}
            <Link
                href="/auth/login"
                className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la connexion
            </Link>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense
                    fallback={
                        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 text-center text-slate-500">
                            Chargement...
                        </div>
                    }
                >
                    <ErrorContent />
                </Suspense>
            </div>
        </div>
    );
}
