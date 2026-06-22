"use client";

import { useState, useTransition } from "react";
import { validatePromoCode } from "@/app/actions/subscription";
import { Tag, Check, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromoResult {
    id: string;
    code: string;
    type: "POURCENTAGE" | "MONTANT_FIXE";
    valeur: number;
    description: string | null;
}

interface PromoCodeInputProps {
    plan?: string;
    onApply?: (promo: PromoResult | null) => void;
}

export default function PromoCodeInput({ plan, onApply }: PromoCodeInputProps) {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState("");
    const [isPending, startTransition] = useTransition();
    const [applied, setApplied] = useState<PromoResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleValidate = () => {
        if (!code.trim()) return;
        setError(null);
        startTransition(async () => {
            const res = await validatePromoCode(code.trim(), plan);
            if (res.valid && res.promo) {
                setApplied(res.promo as PromoResult);
                onApply?.(res.promo as PromoResult);
            } else {
                setError(res.message ?? "Code invalide");
                setApplied(null);
                onApply?.(null);
            }
        });
    };

    const handleRemove = () => {
        setApplied(null);
        setCode("");
        setError(null);
        onApply?.(null);
    };

    return (
        <div className="w-full">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors font-medium"
            >
                <Tag className="h-4 w-4" />
                {applied ? (
                    <span className="text-emerald-600 font-bold">Code <span className="font-mono">{applied.code}</span> appliqué</span>
                ) : (
                    "J'ai un code promo"
                )}
                {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {open && (
                <div className="mt-3">
                    {applied ? (
                        /* Code appliqué — affiche la réduction */
                        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                                <Check className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-emerald-800 font-mono">{applied.code}</p>
                                <p className="text-xs text-emerald-600">
                                    {applied.type === "POURCENTAGE"
                                        ? `-${applied.valeur}% sur votre abonnement`
                                        : `-${applied.valeur.toLocaleString("fr-FR")} FCFA sur votre abonnement`}
                                    {applied.description && ` — ${applied.description}`}
                                </p>
                            </div>
                            <button
                                onClick={handleRemove}
                                className="text-emerald-400 hover:text-red-500 transition-colors flex-shrink-0"
                                title="Retirer le code"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        /* Champ de saisie */
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => { setCode(e.target.value.toUpperCase()); setError(null); }}
                                    onKeyDown={e => e.key === "Enter" && handleValidate()}
                                    placeholder="GYNAEASY20"
                                    maxLength={32}
                                    className={cn(
                                        "flex-1 border rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest uppercase focus:outline-none transition-all",
                                        error
                                            ? "border-red-300 bg-red-50 text-red-800 focus:border-red-400"
                                            : "border-slate-200 bg-slate-50 text-slate-800 focus:border-violet-400 focus:bg-white"
                                    )}
                                />
                                <button
                                    onClick={handleValidate}
                                    disabled={isPending || !code.trim()}
                                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 flex-shrink-0"
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider"}
                                </button>
                            </div>
                            {error && (
                                <p className="text-xs text-red-600 flex items-center gap-1.5">
                                    <X className="h-3 w-3" /> {error}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
