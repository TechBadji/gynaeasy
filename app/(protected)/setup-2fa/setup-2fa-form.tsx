"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Copy, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { generateTwoFactorSetup, enableTwoFactor } from "@/app/actions/twofa";
import toast from "react-hot-toast";
import Image from "next/image";

export default function Setup2FAForm() {
    const router = useRouter();
    const { update } = useSession();
    const [isPending, startTransition] = useTransition();
    const [phase, setPhase] = useState<"init" | "setup">("init");
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [copiedSecret, setCopiedSecret] = useState(false);

    const handleStart = () => {
        startTransition(async () => {
            const res = await generateTwoFactorSetup();
            if (res.success) {
                setQrCodeUrl(res.qrCodeUrl);
                setSecret(res.secret);
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
                toast.success("Double authentification activée !");
                await update({ twoFactorSetupRequired: false });
                router.push("/dashboard");
                router.refresh();
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

    if (phase === "init") {
        return (
            <button
                onClick={handleStart}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-pink-500/20 transition-all disabled:opacity-50"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Commencer la configuration
            </button>
        );
    }

    return (
        <div className="space-y-6">
            {/* QR Code */}
            <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                    1. Scannez ce QR code avec votre application
                </p>
                {qrCodeUrl && (
                    <div className="inline-block border-2 border-slate-200 rounded-xl p-3 bg-white">
                        <Image src={qrCodeUrl} alt="QR Code 2FA" width={180} height={180} />
                    </div>
                )}
            </div>

            {/* Clé manuelle */}
            <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">
                    Ou saisissez cette clé manuellement
                </p>
                <div className="flex items-center gap-2">
                    <code className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 break-all">
                        {secret}
                    </code>
                    <button
                        onClick={copySecret}
                        className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        {copiedSecret ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Code de vérification */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                    2. Entrez le code généré par l'application
                </label>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    autoFocus
                    className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                />
                <p className="text-xs text-slate-400 mt-1.5">Le code expire toutes les 30 secondes.</p>
            </div>

            <button
                onClick={handleEnable}
                disabled={isPending || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-pink-500/20 transition-all disabled:opacity-50 mt-4"
            >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Activer et accéder à l'application
            </button>
        </div>
    );
}
