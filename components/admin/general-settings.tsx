"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone, Mail, Coins, Save } from "lucide-react";

export default function GeneralSettings({ settings }: { settings: any }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clinicName: settings.clinicName || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        currency: settings.currency || "FCFA",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSettings(formData);
            toast.success("Paramètres mis à jour avec succès");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-pink-600" />
                            Informations de la Clinique
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nom de la clinique</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.clinicName}
                                            onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                            placeholder="Ex: Clinique Gynaeasy"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Devise de l'application</label>
                                    <div className="relative">
                                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                            placeholder="Ex: FCFA, €"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700">Adresse</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none min-h-[80px]"
                                            placeholder="Adresse complète..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Téléphone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                            placeholder="+221..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email de contact</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:outline-none"
                                            placeholder="contact@clinique.com"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {loading ? "Enregistrement..." : "Sauvegarder les paramètres"}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Aperçu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Entête document</p>
                            <h3 className="font-bold text-slate-900">{formData.clinicName || "Gynaeasy"}</h3>
                            <p className="text-sm text-slate-600 whitespace-pre-line text-xs">{formData.address || "Adresse non renseignée"}</p>
                            <p className="text-xs text-slate-600">{formData.phone && `Tél: ${formData.phone}`}</p>
                        </div>
                        <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                            <p className="text-xs text-pink-600 uppercase font-bold mb-1">Configuration Monnaie</p>
                            <p className="text-sm text-slate-700">Toutes les factures seront émises en <span className="font-bold">{formData.currency}</span>.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
