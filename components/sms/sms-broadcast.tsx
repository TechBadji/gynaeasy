"use client";

import { useState, useMemo, useEffect } from "react";
import {
    MessageSquare, Search, Send, Loader2, CheckCircle2,
    AlertTriangle, Users, Bell, Calendar, ChevronLeft,
    ChevronRight, ExternalLink
} from "lucide-react";
import { broadcastMessage, sendDailyReminders, getRemindersCount } from "@/app/actions/reminders";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

interface Patient {
    id: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    civilite: string | null;
}

interface Props {
    patients: Patient[];
    role: string;
}

type Channel = "sms" | "whatsapp";

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
    return tel.slice(0, 3) + "•••••" + tel.slice(-2);
}

export default function SmsBroadcast({ patients, role }: Props) {
    const [tab, setTab] = useState<"rappels" | "broadcast">("rappels");

    // ── Rappels tab ──────────────────────────────────────────────────────────
    const [reminderDate, setReminderDate] = useState(() => addDays(new Date(), 1));
    const [reminderCount, setReminderCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);
    const [sendingReminders, setSendingReminders] = useState(false);

    const loadReminderCount = async (date: Date) => {
        setLoadingCount(true);
        setReminderCount(null);
        const n = await getRemindersCount(date);
        setReminderCount(n);
        setLoadingCount(false);
    };

    useEffect(() => { loadReminderCount(reminderDate); }, []);

    const changeDate = (delta: number) => {
        const nd = addDays(reminderDate, delta);
        if (nd < new Date()) return;
        setReminderDate(nd);
        loadReminderCount(nd);
    };

    const handleSendReminders = async () => {
        setSendingReminders(true);
        const tid = toast.loading("Envoi des rappels en cours…");
        const res = await sendDailyReminders(reminderDate);
        setSendingReminders(false);
        if (res.success) {
            toast.success(res.message, { id: tid });
            setReminderCount(0);
        } else {
            toast.error(res.message || "Erreur", { id: tid });
        }
    };

    // ── Broadcast tab ─────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [channels, setChannels] = useState<Set<Channel>>(new Set<Channel>(["sms"]));
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [result, setResult] = useState<{ message: string; ok: boolean } | null>(null);

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

    const charLen = message.length;
    const numSms = smsCount(charLen);
    const charColor = numSms === 1 ? "text-emerald-600" : numSms === 2 ? "text-amber-500" : "text-red-500";

    const canSend = selected.size > 0 && message.trim().length > 0 && message.length <= 480 && !sending;

    const handleSend = async () => {
        if (!confirmed) { setConfirmed(true); return; }
        setSending(true);
        setResult(null);
        const res = await broadcastMessage(Array.from(selected), message, Array.from(channels) as Channel[]);
        setSending(false);
        setConfirmed(false);
        if (res.success) {
            setResult({ message: res.message!, ok: true });
            setSelected(new Set());
            setMessage("");
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

            {/* ═══════════════ RAPPELS TAB ═══════════════ */}
            {tab === "rappels" && (
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Rappels automatiques</h2>
                            <p className="text-sm text-slate-500 mt-1">SMS de rappel RDV envoyés aux patients pour la date sélectionnée.</p>
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <button onClick={() => changeDate(-1)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="text-center">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Date sélectionnée</p>
                                <p className="font-bold text-slate-800 capitalize">
                                    {format(reminderDate, "EEEE d MMMM", { locale: fr })}
                                </p>
                            </div>
                            <button onClick={() => changeDate(1)} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">Rappels en attente</p>
                                    <p className="font-black text-2xl text-indigo-700">
                                        {loadingCount ? <Loader2 className="h-5 w-5 animate-spin inline" /> : reminderCount ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSendReminders}
                            disabled={sendingReminders || reminderCount === 0 || loadingCount}
                            className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${reminderCount === 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"}`}
                        >
                            {sendingReminders
                                ? <><Loader2 className="h-5 w-5 animate-spin" /> Envoi…</>
                                : reminderCount === 0
                                    ? <><CheckCircle2 className="h-5 w-5" /> Tout est à jour</>
                                    : <><Send className="h-5 w-5" /> Envoyer {reminderCount} rappel{reminderCount! > 1 ? "s" : ""}</>
                            }
                        </button>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-900 text-sm">Automatisation des rappels</h3>
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
            )}

            {/* ═══════════════ BROADCAST TAB ═══════════════ */}
            {tab === "broadcast" && (
                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Patient list */}
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
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
                                </button>
                                <span className="text-xs text-slate-400 font-medium">
                                    <Users className="h-3.5 w-3.5 inline mr-1" />
                                    {filtered.length} patient{filtered.length > 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-10">Aucun patient avec numéro de téléphone</p>
                            ) : filtered.map(p => {
                                const wa = waLink(p.telephone);
                                const isSelected = selected.has(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${isSelected ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleOne(p.id)}
                                            className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 hover:border-indigo-400"}`}
                                        >
                                            {isSelected && (
                                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12">
                                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Info */}
                                        <button onClick={() => toggleOne(p.id)} className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {p.civilite ? `${p.civilite} ` : ""}{p.nom.toUpperCase()} {p.prenom}
                                            </p>
                                            <p className="text-xs text-slate-400">{maskPhone(p.telephone)}</p>
                                        </button>

                                        {/* Direct WhatsApp link */}
                                        {wa && (
                                            <a
                                                href={wa}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                title="Ouvrir WhatsApp"
                                                className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                            >
                                                <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.12 1.534 5.857L0 24l6.335-1.508A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.06-1.406l-.362-.215-3.762.895.953-3.67-.236-.376A9.818 9.818 0 1112 21.818z" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Composer */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-5">
                            <h2 className="font-bold text-slate-900">Composer le message</h2>

                            {/* Channel selector */}
                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Canal d'envoi</p>
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

                            {/* Textarea */}
                            <div>
                                <textarea
                                    value={message}
                                    onChange={e => { setMessage(e.target.value); setConfirmed(false); setResult(null); }}
                                    maxLength={480}
                                    rows={6}
                                    placeholder="Ex: Le cabinet sera fermé demain. Vos RDV seront reprogrammés. Merci de nous contacter."
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

                            {/* Summary */}
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${selected.size > 0 ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-100"}`}>
                                <Users className={`h-5 w-5 flex-shrink-0 ${selected.size > 0 ? "text-indigo-500" : "text-slate-400"}`} />
                                <div className="flex-1">
                                    <p className={`text-sm font-bold ${selected.size > 0 ? "text-indigo-800" : "text-slate-500"}`}>
                                        {selected.size} destinataire{selected.size > 1 ? "s" : ""} — via {channelLabel()}
                                    </p>
                                    {selected.size > 0 && channels.has("sms") && numSms > 1 && (
                                        <p className="text-xs text-amber-600 font-medium mt-0.5">
                                            Message long : {numSms} SMS × {selected.size} = {selected.size * numSms} SMS au total
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Result */}
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

                            {/* Confirm / Send */}
                            {confirmed && !sending ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-amber-700 text-center bg-amber-50 border border-amber-100 rounded-xl p-3">
                                        Confirmer l'envoi via {channelLabel()} à {selected.size} destinataire{selected.size > 1 ? "s" : ""} ?
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

                        <div className="flex items-center gap-2 text-xs text-slate-400 text-center justify-center">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Les icônes WhatsApp verts dans la liste permettent d'ouvrir une conversation directe (sans passer par l'API).</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
