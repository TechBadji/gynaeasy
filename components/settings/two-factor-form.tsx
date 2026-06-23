"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, ShieldCheck, ShieldOff, Copy, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { generateTwoFactorSetup, enableTwoFactor, disableTwoFactor } from "@/app/actions/twofa";
import toast from "react-hot-toast";
import Image from "next/image";

interface TwoFactorFormProps {
    initialEnabled: boolean;
    required?: boolean;
    onEnabled?: () => void;
}

export default function TwoFactorForm({ initialEnabled, required = false, onEnabled }: TwoFactorFormProps) {
    const { update } = useSession();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [enabled, setEnabled] = useState(initialEnabled);
    const [phase, setPhase] = useState<"idle" | "setup" | "disable">("idle");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [copiedSecret, setCopiedSecret] = useState(false);

    const handleStartSetup = () => {
        startTransition(async () => {
            const res = await generateTwoFactorSetup();
            if (res.success) {
                setQrCodeUrl(res.qrCodeUrl);
                setSecret(res.secret);
                setCode("");
                setPhase("setup");
            } else {
                toast.error(res.error || "Erreur lors de la génération");
            }
        });
    };

    const handleEnable = () => {
        if (code.length !== 6) return;
        startTransition(async () => {
            const res = await enableTwoFactor(code);
            if (res.success) {
                setEnabled(true);
                setPhase("idle");
                setQrCodeUrl("");
                setSecret("");
                setCode("");
                toast.success("Double authentification activée !");
                await update({ twoFactorSetupRequired: false });
                router.refresh(); // Re-render layout → banner disparaît
                onEnabled?.();
            } else {
                toast.error(res.error || "Code invalide");
            }
        });
    };

    const handleDisable = () => {
        if (code.length !== 6) return;
        startTransition(async () => {
            const res = await disableTwoFactor(code);
            if (res.success) {
                setEnabled(false);
                setPhase("idle");
                setCode("");
                toast.success("Double authentification désactivée");
            } else {
                toast.error(res.error || "Code invalide");
            }
        });
    };

    const copySecret = async () => {
        await navigator.clipboard.writeText(secret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                {enabled
                    ? <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    : <Shield className="h-5 w-5 text-slate-400" />
                }
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Double authentification (2FA)</h3>
                    <p className="text-xs text-slate-500">
                        {enabled ? "Votre compte est protégé par une application d'authentification (Google Authenticator recommandé)." : "Ajoutez une couche de sécurité supplémentaire à votre compte."}
                    </p>
                </div>
                <div className="ml-auto">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"}`}>
                        {enabled ? "Activée" : "Désactivée"}
                    </span>
                </div>
            </div>

            <div className="px-6 py-5 space-y-5">
                {/* Alerte si requis */}
                {required && !enabled && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                            L'administrateur exige que vous activiez la 2FA pour accéder à l'application.
                        </p>
                    </div>
                )}

                {/* État : idle */}
                {phase === "idle" && (
                    <>
                        {!enabled ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    La 2FA utilise une application comme <strong>Google Authenticator</strong>, <strong>Authy</strong> ou <strong>1Password</strong> pour générer un code unique à chaque connexion.
                                </p>
                                <button
                                    onClick={handleStartSetup}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                    Configurer la 2FA
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                    La double authentification est active. Votre compte est protégé.
                                </div>
                                <button
                                    onClick={() => { setPhase("disable"); setCode(""); }}
                                    disabled={isPending}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <ShieldOff className="h-4 w-4" />
                                    Désactiver la 2FA
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* État : configuration */}
                {phase === "setup" && (
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-3">
                                1. Scannez ce QR code avec votre application d'authentification
                            </p>
                            {qrCodeUrl && (
                                <div className="inline-block border-2 border-slate-200 rounded-xl p-3 bg-white">
                                    <Image src={qrCodeUrl} alt="QR Code 2FA" width={180} height={180} />
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-2">
                                Ou saisissez manuellement cette clé secrète
                            </p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 break-all">
                                    {secret}
                                </code>
                                <button
                                    onClick={copySecret}
                                    title="Copier"
                                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    {copiedSecret ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                2. Entrez le code généré par l'application pour confirmer
                            </label>
                            <div className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    className="w-40 px-3 py-2 text-center text-xl tracking-widest font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setPhase("idle"); setCode(""); }}
                                        className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleEnable}
                                        disabled={isPending || code.length !== 6}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                                        Activer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* État : désactivation */}
                {phase === "disable" && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700">
                                Désactiver la 2FA rend votre compte moins sécurisé. Confirmez avec un code de votre application.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Code de votre application
                            </label>
                            <div className="flex gap-3 items-start">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    className="w-40 px-3 py-2 text-center text-xl tracking-widest font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setPhase("idle"); setCode(""); }}
                                        className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleDisable}
                                        disabled={isPending || code.length !== 6}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                                        Désactiver
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
