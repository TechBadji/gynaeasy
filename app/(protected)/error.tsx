"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ProtectedError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("[ProtectedError]:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Une erreur est survenue</h2>
            <p className="text-sm text-slate-500 mb-1 max-w-sm">
                Un problème inattendu s&apos;est produit. Si le problème persiste, contactez le support.
            </p>
            {error.digest && (
                <p className="text-xs text-slate-400 font-mono mb-6">Code : {error.digest}</p>
            )}
            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all"
                >
                    <RefreshCw className="h-4 w-4" />
                    Réessayer
                </button>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                    <Home className="h-4 w-4" />
                    Tableau de bord
                </Link>
            </div>
        </div>
    );
}
