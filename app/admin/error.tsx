"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Admin Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6 text-white font-sans">
            <div className="max-w-md w-full bg-[#0d1526] border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Une erreur est survenue</h2>
                    <p className="text-sm text-slate-400">
                        {error.message || "Impossible de charger le tableau de bord Super Admin."}
                    </p>
                    {error.digest && (
                        <p className="text-[10px] text-slate-600 font-mono mt-2">ID: {error.digest}</p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-pink-500/20"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Réessayer
                    </button>

                    <a
                        href="/auth/login"
                        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl transition-all border border-white/10"
                    >
                        <Home className="h-4 w-4" />
                        Retour à la connexion
                    </a>
                </div>
            </div>
        </div>
    );
}
