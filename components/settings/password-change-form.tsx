"use client";

import { useState } from "react";
import { Lock, Save, Loader2, CheckCircle2 } from "lucide-react";
import { updatePassword } from "@/app/actions/user";
import toast from "react-hot-toast";

export default function PasswordChangeForm() {
    const [isSaving, setIsSaving] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.new !== passwords.confirm) {
            return toast.error("Les nouveaux mots de passe ne correspondent pas");
        }
        
        if (passwords.new.length < 8) {
            return toast.error("Le nouveau mot de passe doit faire au moins 8 caractères");
        }

        setIsSaving(true);
        try {
            const res = await updatePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            
            if (res.success) {
                toast.success("Mot de passe mis à jour !");
                setPasswords({ current: "", new: "", confirm: "" });
            } else {
                toast.error(res.error || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur réseau");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 border border-pink-100">
                        <Lock className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Sécurité du Compte</h2>
                        <p className="text-sm text-slate-500 font-medium">Changez votre mot de passe pour assurer la sécurité de vos données.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Lock className="h-3 w-3" />
                                Mot de passe actuel
                            </label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Lock className="h-3 w-3" />
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Lock className="h-3 w-3" />
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all font-mono"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-slate-100 flex items-center gap-3 transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Mise à jour...</>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Changer le mot de passe
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}
