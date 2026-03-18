"use client";

import { useState } from "react";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Quote,
    Save,
    Image as ImageIcon,
    User,
    Stethoscope
} from "lucide-react";
import { updateClinicSettings } from "@/app/actions/clinic";
import { updateUserDetails } from "@/app/actions/user";
import toast from "react-hot-toast";

interface ClinicSettings {
    id: string;
    nom: string;
    adresse: string | null;
    telephone: string | null;
    email: string | null;
    slogan: string | null;
}

interface UserSettings {
    id: string;
    name: string;
    clinicName: string;
    specialite: string;
}

export default function ClinicSettingsForm({ 
    initialSettings, 
    userSettings 
}: { 
    initialSettings: ClinicSettings,
    userSettings: UserSettings
}) {
    const [settings, setSettings] = useState(initialSettings);
    const [userDetails, setUserDetails] = useState(userSettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Mise à jour des identités
            const [resClinic, resUser] = await Promise.all([
                updateClinicSettings({
                    nom: settings.nom,
                    adresse: settings.adresse || undefined,
                    telephone: settings.telephone || undefined,
                    email: settings.email || undefined,
                    slogan: settings.slogan || undefined,
                }),
                updateUserDetails({
                    name: userDetails.name,
                    clinicName: userDetails.clinicName,
                    specialite: userDetails.specialite
                })
            ]);

            if (resClinic.success && resUser.success) {
                toast.success("Tous les paramètres ont été enregistrés");
            } else if (resUser.success) {
                toast.success("Identité mise à jour");
            } else {
                toast.error("Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Erreur de communication avec le serveur");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12 max-w-4xl">
            {/* Section 1: Identité Personnelle & Cabinet */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Votre Identité</h2>
                        <p className="text-sm text-slate-500 font-medium">Informations affichées sur votre profil et vos ordonnances.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Votre Nom Complet
                            </label>
                            <input
                                type="text"
                                value={userDetails.name}
                                onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-bold"
                                placeholder="Dr. Prénom Nom"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Stethoscope className="h-3 w-3" />
                                Spécialité
                            </label>
                            <input
                                type="text"
                                value={userDetails.specialite}
                                onChange={(e) => setUserDetails({ ...userDetails, specialite: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                                placeholder="ex: Gynécologue Obstétricien"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                Nom de votre Cabinet
                            </label>
                            <input
                                type="text"
                                value={userDetails.clinicName}
                                onChange={(e) => setUserDetails({ ...userDetails, clinicName: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-black text-indigo-600"
                                placeholder="ex: Cabinet Médical Gynaeasy"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Identité Globale (Optionnel selon rôle, mais ici affichée) */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                        <Globe className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Branding Global & Mentions</h2>
                        <p className="text-xs text-slate-400">Paramètres partagés par l'ensemble de la plateforme.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Quote className="h-3 w-3" />
                                Slogan / Mention Légale
                            </label>
                            <input
                                type="text"
                                value={settings.slogan || ""}
                                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-serif italic"
                                placeholder="ex: Votre santé, notre priorité"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                Email Support
                            </label>
                            <input
                                type="email"
                                value={settings.email || ""}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="contact@gynaeasy.com"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center gap-3 transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <>Sauvegarde...</>
                    ) : (
                        <>
                            <Save className="h-5 w-5" />
                            Enregistrer tous les paramètres
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

// Helper icons
import { Globe } from "lucide-react";
