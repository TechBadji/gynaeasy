"use client";

import { useState, useTransition, useEffect } from "react";
import { updateAppSettings } from "@/app/actions/superadmin";
import { sendTestSMS, getReminderStats } from "@/app/actions/reminders";
import {
    Settings, Save, Globe, Phone, Mail, MapPin,
    DollarSign, CheckCircle2, MessageSquare, Send,
    Loader2, BarChart3, RefreshCw, ShieldCheck, UserCheck,
    Shield, Bell, Clock, Calendar, Zap, Copy,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminSettings({ settings, onlySMS = false }: { settings: any, onlySMS?: boolean }) {
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        clinicName: settings?.clinicName || settings?.nom || "Gynaeasy",
        address: settings?.address || settings?.adresse || "",
        phone: settings?.phone || settings?.telephone || "",
        email: settings?.email || "",
        currency: settings?.currency || "FCFA",
        requireApproval: settings?.requireApproval ?? false,
        require2FAForAll: settings?.require2FAForAll ?? false,
    });

    const [testPhone, setTestPhone] = useState("");
    const [testLoading, setTestLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const res = await getReminderStats();
            setStats(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => { fetchStats(); }, []);

    const handleChange = (field: string, value: any) => {
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
            const res = await sendTestSMS(testPhone, "Test Gynaeasy — rappel de votre rendez-vous.");
            if ((res as any).debug) console.info("[SMS DEBUG]", JSON.stringify((res as any).debug, null, 2));
            if (res.success) {
                toast.success(res.message);
                fetchStats();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Erreur lors du test");
        } finally {
            setTestLoading(false);
        }
    };

    const cronUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/reminders/cron`;
    const handleCopy = () => {
        navigator.clipboard.writeText(cronUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    {onlySMS ? "SMS & Rappels automatiques" : "Paramètres Globaux"}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    {onlySMS ? "Gérez l'automatisation des rappels SMS pour tous les clients." : "Configuration de la plateforme SaaS"}
                </p>
            </div>

            {/* ── Stats rappels ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                        <button onClick={fetchStats} disabled={loadingStats} className="text-slate-500 hover:text-white transition-colors">
                            <RefreshCw className={`h-3.5 w-3.5 ${loadingStats ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                    <div className="text-2xl font-black text-white">
                        {loadingStats ? "…" : (stats?.totalMonth ?? "—")}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Rappels ce mois</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Bell className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="text-2xl font-black text-white">
                        {loadingStats ? "…" : (stats?.totalAll ?? "—")}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total rappels envoyés</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-400">
                        {loadingStats ? "…" : (stats?.pendingTomorrow ?? "—")}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">En attente demain</div>
                </div>
            </div>

            {/* ── Rappels automatiques (cron) ────────────────────────────── */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-semibold text-white">Rappels automatiques</span>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${stats?.cronConfigured ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${stats?.cronConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                        {stats?.cronConfigured ? "Cron actif" : "Non configuré"}
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Configurez un cron externe (ex : <span className="text-violet-400 font-semibold">cron-job.org</span>) pour envoyer automatiquement les rappels SMS à tous les patients chaque soir à <strong className="text-white">20h00</strong>.
                    </p>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Endpoint cron</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-black/30 rounded-lg px-4 py-3 font-mono text-xs text-violet-300 border border-white/5 select-all break-all">
                                GET /api/reminders/cron
                            </div>
                            <button
                                onClick={handleCopy}
                                className="flex-shrink-0 h-9 w-9 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 flex items-center justify-center transition-colors"
                                title="Copier l'URL"
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-violet-400" />}
                            </button>
                        </div>

                        <div className="bg-black/30 rounded-lg px-4 py-3 font-mono text-xs text-slate-400 border border-white/5">
                            <span className="text-slate-600">Header :</span>{" "}
                            <span className="text-amber-400">Authorization</span>
                            <span className="text-slate-600">: Bearer </span>
                            <span className="text-emerald-400">{"<CRON_SECRET>"}</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-violet-500/5 rounded-xl border border-violet-500/15">
                        <Zap className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-slate-400 leading-relaxed">
                            Ajoutez <code className="bg-white/10 px-1.5 py-0.5 rounded text-violet-300 font-mono">CRON_SECRET</code> dans Coolify → Variables d'environnement, puis utilisez la même valeur dans l'en-tête Authorization de votre cron.
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Test SMS LAM ──────────────────────────────────────────────── */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden max-w-2xl">
                <div className="flex items-center justify-between p-5 border-b border-white/5 bg-violet-500/5">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-semibold text-white">Test SMS — LaFricaMobile</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${stats?.lamConfigured ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-500 border border-amber-500/30"}`}>
                        {stats?.lamConfigured ? "Mode Réel" : "Mode Simulation"}
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-xs text-slate-400 italic mb-5">
                        Envoyez un SMS de test pour vérifier que LaFricaMobile est correctement configuré.
                    </p>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="tel"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                                placeholder="+22177…"
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                            />
                        </div>
                        <button
                            onClick={handleTestSMS}
                            disabled={testLoading}
                            className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                        >
                            {testLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            Tester l'envoi
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Paramètres généraux ──────────────────────────────────────── */}
            {!onlySMS && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
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
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                            <div className="flex items-center gap-2 p-5 border-b border-white/5 bg-violet-500/5">
                                <ShieldCheck className="h-4 w-4 text-violet-400" />
                                <span className="text-sm font-semibold text-white">Sécurité & Accès</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                                            <UserCheck className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Approbation manuelle</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Validation admin requise pour les nouveaux médecins</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleChange("requireApproval", !form.requireApproval)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${form.requireApproval ? "bg-violet-600" : "bg-slate-700"}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.requireApproval ? "translate-x-6" : "translate-x-1"}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Exiger la 2FA pour tous</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Force la 2FA à la prochaine connexion</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleChange("require2FAForAll", !form.require2FAForAll)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${form.require2FAForAll ? "bg-violet-600" : "bg-slate-700"}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.require2FAForAll ? "translate-x-6" : "translate-x-1"}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl border border-white/10 p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400">Modifications non enregistrées</p>
                                <p className="text-[10px] text-slate-600 italic">
                                    Dernière mise à jour : {new Date(settings.updatedAt).toLocaleString("fr-FR")}
                                </p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${saved || isPending ? "bg-emerald-600 text-white" : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-violet-500/20"}`}
                            >
                                {saved
                                    ? <><CheckCircle2 className="h-4 w-4" /> Sauvegardé !</>
                                    : <><Save className="h-4 w-4" /> {isPending ? "Sauvegarde…" : "Enregistrer tout"}</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
