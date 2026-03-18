"use client";

import { useState, useTransition, useEffect } from "react";
import { updateAppSettings } from "@/app/actions/superadmin";
import { sendTestSMS, getOrangeSMSStats } from "@/app/actions/reminders";
import { 
    Settings, Save, Globe, Phone, Mail, MapPin, 
    DollarSign, CheckCircle2, MessageSquare, Send, 
    Loader2, BarChart3, RefreshCw, AlertCircle 
} from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminSettings({ settings, onlySMS = false }: { settings: any, onlySMS?: boolean }) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        clinicName: settings?.clinicName || "Gynaeasy",
        address: settings?.address || "",
        phone: settings?.phone || "",
        email: settings?.email || "",
        currency: settings?.currency || "FCFA",
    });

    // SMS States
    const [testPhone, setTestPhone] = useState("");
    const [testLoading, setTestLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await getOrangeSMSStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        if (onlySMS) fetchStats();
    }, [onlySMS]);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateAppSettings(form);
                setSaved(true);
                toast.success("Paramètres sauvegardés");
                setTimeout(() => setSaved(false), 3000);
            } catch {
                toast.error("Erreur lors de la sauvegarde");
            }
        });
    };

    const handleTestSMS = async () => {
        if (!testPhone) return toast.error("Entrez un numéro de téléphone");
        
        setTestLoading(true);
        try {
            const res = await sendTestSMS(testPhone, "Ceci est un test de configuration SMS Gynaeasy via l'API Orange Sénégal.");
            if (res.success) {
                toast.success(res.message);
                fetchStats(); // Update stats after sending
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Erreur lors du test");
        } finally {
            setTestLoading(false);
        }
    };

    const fields = [
        { key: "clinicName", label: "Nom de la plateforme", placeholder: "Gynaeasy", icon: Globe, type: "text" },
        { key: "address", label: "Adresse du siège", placeholder: "Dakar, Sénégal", icon: MapPin, type: "text" },
        { key: "phone", label: "Téléphone de contact", placeholder: "+221 77 000 00 00", icon: Phone, type: "tel" },
        { key: "email", label: "Email de contact", placeholder: "contact@gynaeasy.com", icon: Mail, type: "email" },
        { key: "currency", label: "Devise de facturation", placeholder: "FCFA", icon: DollarSign, type: "text" },
    ];

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white">
                    {onlySMS ? "Consommation & Rappels SMS" : "Paramètres Globaux"}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {onlySMS ? "Surveillez votre solde Orange et testez l'envoi." : "Configuration de la plateforme SaaS"}
                </p>
            </div>

            {onlySMS && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 border border-indigo-500/20 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 className="h-4 w-4 text-indigo-400" />
                            <button onClick={fetchStats} disabled={loadingStats} className="text-slate-500 hover:text-white transition-colors">
                                <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="text-2xl font-black text-white">
                            {stats?.partnerStatistics?.statistics?.[0]?.serviceStatistics?.[0]?.countryStatistics?.[0]?.usage ?? "—"}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SMS Envoyés (Total)</div>
                    </div>
                </div>
            )}

            {!onlySMS && (
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden max-w-2xl">
                    <div className="flex items-center gap-2 p-5 border-b border-white/5">
                        <Settings className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-semibold text-white">Informations de la plateforme</span>
                    </div>
                    <div className="p-6 space-y-5">
                        {fields.map((field) => {
                            const Icon = field.icon;
                            return (
                                <div key={field.key}>
                                    <label className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
                                        <Icon className="h-3.5 w-3.5" />
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        value={(form as any)[field.key]}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="px-6 pb-6">
                        <button
                            onClick={handleSave}
                            disabled={isPending}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${saved || isPending ? "bg-emerald-600 text-white" : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white"}`}
                        >
                            {saved ? <><CheckCircle2 className="h-4 w-4" /> Sauvegardé !</> : <><Save className="h-4 w-4" /> {isPending ? "Sauvegarde..." : "Sauvegarder"}</>}
                        </button>
                    </div>
                </div>
            )}

            {/* SMS Test Card */}
            <div className={`bg-white/5 rounded-xl border ${onlySMS ? 'border-indigo-500/30' : 'border-white/10'} overflow-hidden max-w-2xl`}>
                <div className="flex items-center gap-2 p-5 border-b border-white/5 bg-indigo-500/5">
                    <MessageSquare className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-white">Test de l'API SMS Orange</span>
                </div>
                <div className="p-6">
                    <p className="text-xs text-slate-400 mb-4 italic">
                        Vérifiez la configuration réelle en envoyant un message de test.
                    </p>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="tel"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                                placeholder="+22177..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-mono"
                            />
                        </div>
                        <button
                            onClick={handleTestSMS}
                            disabled={testLoading}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                        >
                            {testLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Tester l'envoi
                        </button>
                    </div>
                </div>
            </div>

            {onlySMS && stats && !stats.partnerStatistics?.statistics?.[0] && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 max-w-2xl">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-200/80">
                        Aucune statistique disponible pour le Sénégal. Assurez-vous d'avoir envoyé au moins un SMS et que vos crédits sont actifs.
                    </p>
                </div>
            )}

            {!onlySMS && (
                <div className="bg-red-500/5 rounded-xl border border-red-500/20 overflow-hidden max-w-2xl">
                    <div className="flex items-center gap-2 p-5 border-b border-red-500/10">
                        <span className="text-sm font-semibold text-red-400">Zone de danger</span>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between font-medium">
                            <div>
                                <p className="text-sm text-white">Mode maintenance</p>
                                <p className="text-xs text-slate-400 mt-0.5">Rend l'application inaccessible</p>
                            </div>
                            <button className="text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">Activer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
