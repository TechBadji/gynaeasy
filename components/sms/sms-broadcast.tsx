"use client";

import { useState, useMemo, useEffect } from "react";
import {
    MessageSquare, Search, Send, Loader2, CheckCircle2,
    AlertTriangle, Users, Bell, Calendar, ChevronLeft,
    ChevronRight, X, Zap, Clock, Phone,
} from "lucide-react";
import {
    broadcastMessage, sendDailyReminders, getRemindersCount, getRemindersForDate,
} from "@/app/actions/reminders";
import { addDays, format, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

interface Patient {
    id: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    civilite: string | null;
    prochainRdv: Date | null;
}

interface ReminderAppt {
    id: string;
    dateHeure: Date;
    motif: string | null;
    patient: { nom: string; prenom: string; civilite: string | null; telephone: string | null };
}

interface Props {
    patients: Patient[];
    role: string;
    doctorName: string;
}

type Channel = "sms" | "whatsapp";

// ─── Templates de messages ─────────────────────────────────────────────────
const TEMPLATES = [
    {
        label: "Fermeture cabinet",
        icon: "🔒",
        text: "Le cabinet sera fermé le {DATE}. Vos rendez-vous seront reprogrammés. Contactez-nous au {TEL} pour tout renseignement.",
    },
    {
        label: "Rappel dépistage",
        icon: "🔬",
        text: "Le cabinet vous rappelle l'importance du dépistage annuel (frottis, mammographie). N'hésitez pas à prendre rendez-vous.",
    },
    {
        label: "Résultats disponibles",
        icon: "📋",
        text: "Bonjour, vos résultats d'examens sont disponibles au cabinet. Merci de nous contacter pour convenir d'une consultation.",
    },
    {
        label: "Campagne vaccination",
        icon: "💉",
        text: "Le cabinet propose la vaccination HPV (Papillomavirus). Renseignez-vous auprès de notre équipe lors de votre prochain RDV.",
    },
    {
        label: "Bonne année",
        icon: "🎊",
        text: "Le Dr {MEDECIN} et toute son équipe vous souhaitent une excellente nouvelle année. Prenez soin de vous.",
    },
    {
        label: "Reprise activité",
        icon: "✅",
        text: "Le cabinet reprend son activité normale le {DATE}. Nous sommes à votre disposition pour tout rendez-vous.",
    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function smsCount(len: number) {
    if (len <= 160) return 1;
    if (len <= 320) return 2;
    return 3;
}

function normalizeWaNumber(tel: string): string {
    let n = tel.replace(/[\s\-().+]/g, "").replace(/^00/, "");
    if (!n.startsWith("221")) n = `221${n.startsWith("0") ? n.slice(1) : n}`;
    return n;
}

function waLink(tel: string | null) {
    if (!tel) return null;
    return `https://wa.me/${normalizeWaNumber(tel)}`;
}

function maskPhone(tel: string | null) {
    if (!tel || tel.length < 6) return tel ?? "—";
    return tel.slice(0, 3) + " ••••• " + tel.slice(-2);
}

function labelDate(d: Date | null) {
    if (!d) return null;
    if (isToday(new Date(d))) return "Aujourd'hui";
    if (isTomorrow(new Date(d))) return "Demain";
    return format(new Date(d), "d MMM", { locale: fr });
}

// ─── Composant principal ──────────────────────────────────────────────────
export default function SmsBroadcast({ patients, role, doctorName }: Props) {
    const [tab, setTab] = useState<"rappels" | "broadcast">("rappels");

    // ── Rappels tab ──────────────────────────────────────────────────────
    const [reminderDate, setReminderDate] = useState(() => addDays(new Date(), 1));
    const [reminderCount, setReminderCount] = useState<number | null>(null);
    const [reminderAppts, setReminderAppts] = useState<ReminderAppt[]>([]);
    const [loadingCount, setLoadingCount] = useState(false);
    const [sendingReminders, setSendingReminders] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const loadReminderData = async (date: Date) => {
        setLoadingCount(true);
        setReminderCount(null);
        setReminderAppts([]);
        const [count, appts] = await Promise.all([
            getRemindersCount(date),
            getRemindersForDate(date),
        ]);
        setReminderCount(count);
        setReminderAppts(appts as ReminderAppt[]);
        setLoadingCount(false);
    };

    useEffect(() => { loadReminderData(reminderDate); }, []);

    const changeDate = (delta: number) => {
        const nd = addDays(reminderDate, delta);
        if (nd < new Date() && delta < 0 && !isToday(nd)) return;
        setReminderDate(nd);
        loadReminderData(nd);
    };

    const handleSendReminders = async () => {
        setSendingReminders(true);
        const tid = toast.loading("Envoi des rappels en cours…");
        const res = await sendDailyReminders(reminderDate);
        setSendingReminders(false);
        if (res.success) {
            toast.success(res.message, { id: tid });
            setReminderCount(0);
            setReminderAppts([]);
        } else {
            toast.error(res.message || "Erreur", { id: tid });
        }
    };

    const previewSMS = (appt: ReminderAppt) => {
        const formattedTime = format(new Date(appt.dateHeure), "HH:mm");
        const dateStr = format(new Date(appt.dateHeure), "dd/MM/yyyy");
        return `Bonjour ${appt.patient.civilite ?? ""} ${appt.patient.nom.toUpperCase()}, rappel de votre RDV le ${dateStr} à ${formattedTime} avec le ${doctorName}. Merci d'annuler 24h à l'avance en cas d'empêchement.`;
    };

    // ── Broadcast tab ─────────────────────────────────────────────────────
    const [search, setSearch]     = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [channels, setChannels] = useState<Set<Channel>>(new Set<Channel>(["sms"]));
    const [message, setMessage]   = useState("");
    const [sending, setSending]   = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [result, setResult]     = useState<{ message: string; ok: boolean } | null>(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [singleTarget, setSingleTarget]   = useState<Patient | null>(null);

    const filtered = useMemo(() =>
        patients.filter(p =>
            `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
        ), [patients, search]);

    const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));

    const toggleAll = () => {
        if (allSelected) {
            setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.delete(p.id)); return n; });
        } else {
            setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.add(p.id)); return n; });
        }
    };

    const toggleOne = (id: string) =>
        setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const toggleChannel = (c: Channel) =>
        setChannels(prev => {
            const n = new Set(prev);
            if (n.has(c)) { if (n.size > 1) n.delete(c); } else n.add(c);
            return n;
        });

    const applyTemplate = (tpl: typeof TEMPLATES[number]) => {
        setMessage(tpl.text.replace("{MEDECIN}", doctorName));
        setShowTemplates(false);
        setConfirmed(false);
        setResult(null);
    };

    const openSingle = (p: Patient) => {
        setSingleTarget(p);
        setSelected(new Set([p.id]));
        setMessage("");
        setConfirmed(false);
        setResult(null);
        setShowTemplates(false);
    };

    const closeSingle = () => {
        setSingleTarget(null);
        setSelected(new Set());
    };

    const charLen   = message.length;
    const numSms    = smsCount(charLen);
    const charColor = numSms === 1 ? "text-emerald-600" : numSms === 2 ? "text-amber-500" : "text-red-500";

    const effectiveTargets = singleTarget ? 1 : selected.size;
    const canSend = effectiveTargets > 0 && message.trim().length > 0 && message.length <= 480 && !sending;

    const handleSend = async () => {
        if (!confirmed) { setConfirmed(true); return; }
        setSending(true);
        setResult(null);
        const ids = singleTarget ? [singleTarget.id] : Array.from(selected);
        const res = await broadcastMessage(ids, message, Array.from(channels) as Channel[]);
        setSending(false);
        setConfirmed(false);
        if (res.success) {
            setResult({ message: res.message!, ok: true });
            setSelected(new Set());
            setMessage("");
            setSingleTarget(null);
            toast.success(res.message!);
        } else {
            setResult({ message: res.message ?? "Erreur", ok: false });
            toast.error(res.message ?? "Erreur lors de l'envoi");
        }
    };

    const channelLabel = () => {
        const arr = Array.from(channels);
        if (arr.length === 2) return "SMS + WhatsApp";
        return arr[0] === "sms" ? "SMS" : "WhatsApp";
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {(["rappels", "broadcast"] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        {t === "rappels" ? <Bell className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                        {t === "rappels" ? "Rappels RDV" : "Message groupé"}
                    </button>
                ))}
            </div>

            {/* ══════════════ RAPPELS TAB ══════════════ */}
            {tab === "rappels" && (
                <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                        {/* Panneau principal */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Rappels automatiques</h2>
                                <p className="text-sm text-slate-500 mt-1">SMS envoyés aux patients non encore rappelés pour la date choisie.</p>
                            </div>

                            {/* Sélecteur de date */}
                            <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                <button onClick={() => changeDate(-1)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Date sélectionnée</p>
                                    <p className="font-black text-slate-800 capitalize">
                                        {format(reminderDate, "EEEE d MMMM", { locale: fr })}
                                    </p>
                                    {isTomorrow(reminderDate) && (
                                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Demain</span>
                                    )}
                                    {isToday(reminderDate) && (
                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Aujourd'hui</span>
                                    )}
                                </div>
                                <button onClick={() => changeDate(1)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Compteur */}
                            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border border-violet-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-violet-100 rounded-full flex items-center justify-center">
                                        <Bell className="h-5 w-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-violet-500 font-bold uppercase tracking-widest">Rappels en attente</p>
                                        <p className="font-black text-2xl text-violet-700">
                                            {loadingCount
                                                ? <Loader2 className="h-5 w-5 animate-spin inline" />
                                                : reminderCount ?? "—"
                                            }
                                        </p>
                                    </div>
                                </div>
                                {reminderAppts.length > 0 && (
                                    <button
                                        onClick={() => setShowPreview(v => !v)}
                                        className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
                                    >
                                        {showPreview ? "Masquer" : "Aperçu"}
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleSendReminders}
                                disabled={sendingReminders || reminderCount === 0 || loadingCount}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${reminderCount === 0
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-100"
                                }`}
                            >
                                {sendingReminders
                                    ? <><Loader2 className="h-5 w-5 animate-spin" /> Envoi…</>
                                    : reminderCount === 0
                                        ? <><CheckCircle2 className="h-5 w-5" /> Tout est à jour</>
                                        : <><Send className="h-5 w-5" /> Envoyer {reminderCount} rappel{reminderCount! > 1 ? "s" : ""}</>
                                }
                            </button>
                        </div>

                        {/* Info cron */}
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-amber-900 text-sm">Automatiser les rappels</h3>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                        Configurez un cron externe (ex: cron-job.org) appelant cet endpoint chaque soir à 20h :
                                    </p>
                                    <div className="mt-3 bg-amber-100 rounded-lg p-3 font-mono text-xs text-amber-900 break-all select-all">
                                        GET /api/reminders/cron<br />
                                        Authorization: Bearer {"{CRON_SECRET}"}
                                    </div>
                                    <p className="text-xs text-amber-600 mt-2">
                                        Ajoutez <code className="bg-amber-100 px-1 rounded">CRON_SECRET</code> dans Coolify → Variables d'environnement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Liste des RDV qui recevront un rappel */}
                    {showPreview && reminderAppts.length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                                <p className="text-sm font-bold text-slate-800">
                                    Aperçu des rappels — {format(reminderDate, "d MMMM", { locale: fr })}
                                </p>
                                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                                    {reminderAppts.length} SMS
                                </span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {reminderAppts.map(appt => (
                                    <div key={appt.id} className="px-5 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-4 w-4 text-violet-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {appt.patient.civilite ? `${appt.patient.civilite} ` : ""}
                                                        {appt.patient.nom.toUpperCase()} {appt.patient.prenom}
                                                    </p>
                                                    <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                                                        {format(new Date(appt.dateHeure), "HH:mm")}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {maskPhone(appt.patient.telephone)}
                                                    {appt.motif && <span className="ml-2 text-slate-500">— {appt.motif}</span>}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-2 italic bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
                                                    {previewSMS(appt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════ BROADCAST TAB ══════════════ */}
            {tab === "broadcast" && (
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Liste patients */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col">
                        <div className="p-4 border-b border-slate-100 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un patient…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400 transition-colors"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={toggleAll}
                                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                                >
                                    {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                                </button>
                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {filtered.length} patient{filtered.length > 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[460px] divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
                                    <Users className="h-8 w-8 opacity-30" />
                                    <p className="text-sm">Aucun patient avec numéro</p>
                                </div>
                            ) : filtered.map(p => {
                                const wa = waLink(p.telephone);
                                const isSelected = selected.has(p.id);
                                const rdvLabel = labelDate(p.prochainRdv);
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isSelected ? "bg-violet-50" : "hover:bg-slate-50"}`}
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => { closeSingle(); toggleOne(p.id); }}
                                            className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-violet-600 border-violet-600" : "border-slate-300 hover:border-violet-400"}`}
                                        >
                                            {isSelected && (
                                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Info */}
                                        <button onClick={() => { closeSingle(); toggleOne(p.id); }} className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {p.civilite ? `${p.civilite} ` : ""}{p.nom.toUpperCase()} {p.prenom}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-slate-400">{maskPhone(p.telephone)}</p>
                                                {rdvLabel && (
                                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                        RDV {rdvLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </button>

                                        {/* Actions rapides */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {/* Envoyer 1:1 */}
                                            <button
                                                onClick={() => openSingle(p)}
                                                title="Envoyer un message direct"
                                                className="h-8 w-8 rounded-lg bg-violet-50 hover:bg-violet-100 flex items-center justify-center transition-colors"
                                            >
                                                <Send className="h-3.5 w-3.5 text-violet-600" />
                                            </button>
                                            {/* WhatsApp */}
                                            {wa && (
                                                <a
                                                    href={wa}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={e => e.stopPropagation()}
                                                    title="Ouvrir WhatsApp"
                                                    className="h-8 w-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                                >
                                                    <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.12 1.534 5.857L0 24l6.335-1.508A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.06-1.406l-.362-.215-3.762.895.953-3.67-.236-.376A9.818 9.818 0 1112 21.818z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Composer */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Bandeau envoi direct */}
                        {singleTarget && (
                            <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
                                <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                    <Send className="h-4 w-4 text-violet-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-violet-800">
                                        Message direct à {singleTarget.civilite ? `${singleTarget.civilite} ` : ""}{singleTarget.nom} {singleTarget.prenom}
                                    </p>
                                    <p className="text-xs text-violet-500">{maskPhone(singleTarget.telephone)}</p>
                                </div>
                                <button
                                    onClick={closeSingle}
                                    className="h-7 w-7 rounded-full hover:bg-violet-200 flex items-center justify-center text-violet-500 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-slate-900">
                                    {singleTarget ? "Composer le message" : "Message groupé"}
                                </h2>
                                <button
                                    onClick={() => setShowTemplates(v => !v)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors border border-violet-100"
                                >
                                    <Zap className="h-3.5 w-3.5" />
                                    Modèles
                                </button>
                            </div>

                            {/* Modèles */}
                            {showTemplates && (
                                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    {TEMPLATES.map(tpl => (
                                        <button
                                            key={tpl.label}
                                            onClick={() => applyTemplate(tpl)}
                                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-left"
                                        >
                                            <span className="text-base flex-shrink-0">{tpl.icon}</span>
                                            {tpl.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Canal d'envoi */}
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Canal d'envoi</p>
                                <div className="flex gap-2">
                                    {(["sms", "whatsapp"] as Channel[]).map(c => {
                                        const active = channels.has(c);
                                        return (
                                            <button
                                                key={c}
                                                onClick={() => toggleChannel(c)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${active
                                                    ? c === "sms"
                                                        ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-100"
                                                        : "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100"
                                                    : "border-slate-200 text-slate-400 hover:border-slate-300"
                                                }`}
                                            >
                                                {c === "sms" ? (
                                                    <MessageSquare className="h-4 w-4" />
                                                ) : (
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.12 1.534 5.857L0 24l6.335-1.508A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.06-1.406l-.362-.215-3.762.895.953-3.67-.236-.376A9.818 9.818 0 1112 21.818z" />
                                                    </svg>
                                                )}
                                                {c === "sms" ? "SMS" : "WhatsApp"}
                                            </button>
                                        );
                                    })}
                                    {channels.size === 2 && (
                                        <span className="flex items-center px-3 py-2 rounded-xl bg-violet-50 border-2 border-violet-200 text-xs font-bold text-violet-600">
                                            Double envoi
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Zone texte */}
                            <div>
                                <textarea
                                    value={message}
                                    onChange={e => { setMessage(e.target.value); setConfirmed(false); setResult(null); }}
                                    maxLength={480}
                                    rows={6}
                                    placeholder="Écrivez votre message ou choisissez un modèle ci-dessus…"
                                    className="w-full border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:outline-none focus:border-violet-400 resize-none transition-colors"
                                />
                                <div className="flex items-center justify-between mt-1.5">
                                    {channels.has("sms") ? (
                                        <span className={`text-xs font-semibold ${charColor}`}>
                                            {numSms} SMS / destinataire
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold text-emerald-600">WhatsApp uniquement</span>
                                    )}
                                    <span className={`text-xs font-medium ${charLen > 480 ? "text-red-500" : "text-slate-400"}`}>
                                        {charLen} / 480
                                    </span>
                                </div>
                            </div>

                            {/* Récap destinataires */}
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${effectiveTargets > 0 ? "bg-violet-50 border-violet-100" : "bg-slate-50 border-slate-100"}`}>
                                <Users className={`h-5 w-5 flex-shrink-0 ${effectiveTargets > 0 ? "text-violet-500" : "text-slate-400"}`} />
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${effectiveTargets > 0 ? "text-violet-800" : "text-slate-500"}`}>
                                        {effectiveTargets} destinataire{effectiveTargets > 1 ? "s" : ""} — via {channelLabel()}
                                    </p>
                                    {effectiveTargets > 0 && channels.has("sms") && numSms > 1 && (
                                        <p className="text-xs text-amber-600 font-medium mt-0.5">
                                            Message long : {numSms} SMS × {effectiveTargets} = {effectiveTargets * numSms} SMS au total
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Résultat */}
                            {result && (
                                <div className={`flex items-start gap-3 p-4 rounded-xl border ${result.ok ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                                    {result.ok
                                        ? <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                        : <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
                                    <p className={`text-sm font-semibold ${result.ok ? "text-emerald-800" : "text-red-700"}`}>
                                        {result.message}
                                    </p>
                                </div>
                            )}

                            {/* Bouton envoi / confirmation */}
                            {confirmed && !sending ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-amber-700 text-center bg-amber-50 border border-amber-100 rounded-xl p-3">
                                        Confirmer l'envoi via {channelLabel()} à {effectiveTargets} destinataire{effectiveTargets > 1 ? "s" : ""} ?
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setConfirmed(false)}
                                            className="py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            className="py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Send className="h-4 w-4" /> Confirmer l'envoi
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSend}
                                    disabled={!canSend}
                                    className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {sending
                                        ? <><Loader2 className="h-5 w-5 animate-spin" /> Envoi en cours…</>
                                        : <><Send className="h-5 w-5" /> Envoyer via {channelLabel()}</>
                                    }
                                </button>
                            )}
                        </div>

                        <p className="text-xs text-slate-400 text-center">
                            L'icône verte (WhatsApp) ouvre une conversation directe sans passer par l'API.<br />
                            L'icône violette envoie un message individuel via l'API Orange SMS.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
