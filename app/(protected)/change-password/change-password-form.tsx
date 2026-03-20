"use client";

import { useState, useTransition } from "react";
import { updatePassword } from "@/app/actions/user";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordForm() {
    const { update } = useSession();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const validatePassword = (pwd: string) => {
        const alphanumeric = /^[a-zA-Z0-9]+$/;
        if (pwd.length < 6 || pwd.length > 11) return "Le mot de passe doit contenir entre 6 et 11 caractères.";
        if (!alphanumeric.test(pwd)) return "Seuls les caractères alphanumériques sont autorisés.";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const error = validatePassword(formData.newPassword);
        if (error) {
            toast.error(error);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas.");
            return;
        }

        startTransition(async () => {
            try {
                const res = await updatePassword({ newPassword: formData.newPassword });
                if (res.success) {
                    toast.success("Mot de passe mis à jour !");
                    // Update session to reflect mustChangePassword = false
                    await update({ mustChangePassword: false });
                    router.push("/dashboard");
                    router.refresh();
                } else {
                    toast.error(res.error || "Une erreur est survenue.");
                }
            } catch (err) {
                toast.error("Erreur de connexion serveur.");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">
                        Nouveau mot de passe
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.newPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                            placeholder="6 à 11 caractères alphanumériques"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 block">
                        Confirmer le mot de passe
                    </label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all"
                            placeholder="Répétez le mot de passe"
                        />
                    </div>
                </div>
            </div>

            {/* Validation Hints */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Règles de sécurité :</p>
                <div className="flex items-center gap-2 text-xs">
                    {formData.newPassword.length >= 6 && formData.newPassword.length <= 11 ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-slate-300" />
                    )}
                    <span className={formData.newPassword.length >= 6 && formData.newPassword.length <= 11 ? "text-emerald-700 font-bold" : "text-slate-500"}>
                        Entre 6 et 11 caractères
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    {/^[a-zA-Z0-9]*$/.test(formData.newPassword) && formData.newPassword !== "" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-slate-300" />
                    )}
                    <span className={/^[a-zA-Z0-9]*$/.test(formData.newPassword) && formData.newPassword !== "" ? "text-emerald-700 font-bold" : "text-slate-500"}>
                        Alphanumérique uniquement (A-Z, 0-9)
                    </span>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:from-slate-400 disabled:to-slate-400 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-violet-200 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
                {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        Valider & Accéder à mon espace
                        <Shield className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
}
