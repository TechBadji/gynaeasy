"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyDoctorEmail } from "@/app/actions/onboarding";
import {
    Activity,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Jeton de vérification manquant.");
            return;
        }

        const verify = async () => {
            try {
                await verifyDoctorEmail(token);
                setStatus("success");
            } catch (err: any) {
                setStatus("error");
                setMessage(err.message || "La vérification a échoué.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8 p-12 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shadow-lg">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                </div>

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
                                Merci, votre email a été confirmé. Votre dossier est maintenant entre les mains de notre équipe administrative.
                                Vous recevrez un email avec vos identifiants dès que votre compte sera prêt.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link href="/" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-xl">
                                Retour à l'accueil <ArrowRight className="h-4 w-4" />
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
                        <div className="pt-4">
                            <Link href="/onboarding" className="text-violet-400 font-bold hover:text-violet-300 transition-colors underline underline-offset-4">
                                Réessayer l'inscription
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
