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
    CheckCircle2
} from "lucide-react";
import { updateClinicSettings } from "@/app/actions/clinic";
import toast from "react-hot-toast";

interface ClinicSettings {
    id: string;
    nom: string;
    adresse: string | null;
    telephone: string | null;
    email: string | null;
    slogan: string | null;
}

export default function ClinicSettingsForm({ initialSettings }: { initialSettings: ClinicSettings }) {
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await updateClinicSettings({
                nom: settings.nom,
                adresse: settings.adresse || undefined,
                telephone: settings.telephone || undefined,
                email: settings.email || undefined,
                slogan: settings.slogan || undefined,
            });
            if (res.success) {
                toast.success("Paramètres enregistrés");
            }
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Identité du Cabinet</h2>
                        <p className="text-sm text-slate-500 font-medium">Ces informations apparaîtront sur vos factures et comptes-rendus.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Building2 className="h-3 w-3" />
                                Nom du Cabinet
                            </label>
                            <input
                                type="text"
                                value={settings.nom}
                                onChange={(e) => setSettings({ ...settings, nom: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="ex: Centre Gynécologique Excellence"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Quote className="h-3 w-3" />
                                Slogan ou Mention Légale
                            </label>
                            <input
                                type="text"
                                value={settings.slogan || ""}
                                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-serif italic"
                                placeholder="ex: Votre santé, notre priorité"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 border-dashed flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-20 w-20 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                            <ImageIcon className="h-8 w-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Logo du Cabinet</p>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[150px]">Format PNG ou JPG. Recadré en carré de préférence.</p>
                        </div>
                        <button type="button" className="text-[10px] font-black uppercase text-indigo-600 bg-white px-4 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-50 transition-all">
                            Modifier le logo
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Coordonnées</h2>
                        <p className="text-sm text-slate-500 font-medium">Pour faciliter la communication avec vos patientes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            Adresse Complète
                        </label>
                        <input
                            type="text"
                            value={settings.adresse || ""}
                            onChange={(e) => setSettings({ ...settings, adresse: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="ex: 12 Rue des Almadies, Dakar"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            Téléphone
                        </label>
                        <input
                            type="tel"
                            value={settings.telephone || ""}
                            onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="+221 ..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Email de Contact
                        </label>
                        <input
                            type="email"
                            value={settings.email || ""}
                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            placeholder="contact@nomducabinet.com"
                        />
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
                            Enregistrer les paramètres
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
