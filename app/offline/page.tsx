"use client";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-2xl">
                    <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M8.464 15.536a5 5 0 010-7.072M5.636 18.364a9 9 0 010-12.728" />
                    </svg>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black">Pas de connexion</h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        Gynaeasy nécessite une connexion internet pour accéder aux données médicales.
                        Vérifiez votre réseau et réessayez.
                    </p>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:opacity-90 transition-opacity active:scale-95"
                >
                    Réessayer
                </button>

                <p className="text-slate-600 text-xs font-medium">
                    Gynaeasy — Logiciel Gynécologie
                </p>
            </div>
        </div>
    );
}
