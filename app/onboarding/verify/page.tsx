"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyDoctorEmail, resendVerificationEmail } from "@/app/actions/onboarding";
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowRight,
    Mail
} from "lucide-react";
import Link from "next/link";

// Composant interne qui utilise useSearchParams — doit être dans <Suspense>
function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");
    const [resendEmail, setResendEmail] = useState("");
    const [resendState, setResendState] = useState<"idle" | "sending" | "done">("idle");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Jeton de vérification manquant.");
            return;
        }

        const verify = async () => {
            try {
                const res = await verifyDoctorEmail(token);
                if (res.success) {
                    setStatus("success");
                    if (res.message) setMessage(res.message);
                } else {
                    setStatus("error");
                    setMessage(res.error || "La vérification a échoué.");
                }
            } catch (err: any) {
                setStatus("error");
                setMessage("Impossible de contacter le serveur.");
            }
        };

        verify();
    }, [token]);

    return (
        <>
            {status === "loading" && (
                <div className="space-y-6 animate-pulse">
                    <div className="flex justify-center">
                        <Loader2 className="h-12 w-12 text-violet-400 animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Vérification en cours...</h1>
                        <p className="text-slate-400 font-medium text-sm">Veuillez patienter pendant que nous validons votre adresse email.</p>
                    </div>
                </div>
            )}

            {status === "success" && (
                <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black">Email Vérifié !</h1>
                        <p className="text-slate-400 font-medium">
                            {message || "Merci, votre email a été confirmé. Vous recevrez un email avec vos identifiants dès que votre compte sera prêt."}
                        </p>
                    </div>
                    <div className="pt-4">
                        <Link href="/" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-xl">
                            Retour à l&apos;accueil <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">Erreur de vérification</h1>
                        <p className="text-red-400 font-medium text-sm">{message}</p>
                    </div>

                    {/* Renvoi email */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Recevoir un nouveau lien</p>
                        {resendState === "done" ? (
                            <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Email envoyé si votre adresse est enregistrée.
                            </p>
                        ) : (
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/20 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <button
                                    disabled={resendState === "sending" || !resendEmail}
                                    onClick={async () => {
                                        setResendState("sending");
                                        await resendVerificationEmail(resendEmail);
                                        setResendState("done");
                                    }}
                                    className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 text-white text-xs font-bold px-4 rounded-xl transition-colors flex-shrink-0"
                                >
                                    {resendState === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Link href="/onboarding" className="text-slate-400 text-sm hover:text-violet-400 transition-colors underline underline-offset-4">
                            Créer un nouveau compte
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 p-12 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-lg">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                </div>

                <Suspense
                    fallback={
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <Loader2 className="h-12 w-12 text-violet-400 animate-spin" />
                            </div>
                            <p className="text-slate-400 font-medium text-sm">Chargement...</p>
                        </div>
                    }
                >
                    <VerifyContent />
                </Suspense>
            </div>
        </div>
    );
}
