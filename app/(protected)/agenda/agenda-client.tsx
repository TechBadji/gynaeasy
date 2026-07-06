"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfWeek, getDay, parse, differenceInMinutes } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, dateFnsLocalizer, Views, type View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
    Plus, X, Loader2, CalendarPlus, Trash2, ExternalLink,
    Clock, Globe, Phone, User, CalendarCheck, ChevronLeft,
    ChevronRight, LayoutGrid, CalendarDays, List, CheckCircle2,
    MessageSquare, Video, Sparkles, Mic, MicOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createRdv, cancelRdv, type RdvFormState } from "@/app/actions/rdv";
import toast from "react-hot-toast";
import Link from "next/link";

// ─── Localizer ───────────────────────────────────────────────────────────────
const locales = { fr };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

// ─── Types ───────────────────────────────────────────────────────────────────
type SerializedEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    type: string;
    source: string;
    motif: string | null;
    duree: number;
    patientId: string;
    patientNom: string;
    patientPrenom: string;
    patientCivilite: string;
};

type CalendarEvent = Omit<SerializedEvent, "start" | "end"> & {
    start: Date;
    end: Date;
};

type Patient = {
    id: string;
    nom: string;
    prenom: string;
    civilite: string;
    telephone?: string | null;
};

type Props = {
    initialEvents: SerializedEvent[];
    patients: Patient[];
    stats: { today: number; week: number; nextRdv: string | null };
};

// ─── Config par type ─────────────────────────────────────────────────────────
const RDV_TYPES = [
    { value: "CONSULTATION",     label: "Consultation",     icon: User },
    { value: "ECHOGRAPHIE",      label: "Échographie",      icon: Video },
    { value: "SUIVI_GROSSESSE",  label: "Suivi grossesse",  icon: CalendarCheck },
    { value: "URGENCE",          label: "Urgence",          icon: MessageSquare },
    { value: "TELECONSULTATION", label: "Téléconsultation", icon: Globe },
] as const;

type RdvTypeValue = (typeof RDV_TYPES)[number]["value"];

const TYPE_STYLE: Record<string, {
    bg: string; color: string; dot: string;
    pill: string; pillSel: string;
}> = {
    CONSULTATION:     { bg: "#f0fdf4", color: "#15803d", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400",  pillSel: "bg-emerald-600 text-white border-transparent shadow-sm" },
    ECHOGRAPHIE:      { bg: "#fdf4ff", color: "#a21caf", dot: "bg-fuchsia-500", pill: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:border-fuchsia-400", pillSel: "bg-fuchsia-600 text-white border-transparent shadow-sm" },
    SUIVI_GROSSESSE:  { bg: "#fdf2f8", color: "#be185d", dot: "bg-pink-500",    pill: "bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-400",             pillSel: "bg-pink-600 text-white border-transparent shadow-sm" },
    URGENCE:          { bg: "#fef2f2", color: "#b91c1c", dot: "bg-red-500",     pill: "bg-red-50 text-red-700 border-red-200 hover:border-red-400",                  pillSel: "bg-red-600 text-white border-transparent shadow-sm" },
    TELECONSULTATION: { bg: "#eff6ff", color: "#1d4ed8", dot: "bg-blue-500",    pill: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400",              pillSel: "bg-blue-600 text-white border-transparent shadow-sm" },
};

const DUREES = [
    { value: "15", label: "15 min" },
    { value: "30", label: "30 min" },
    { value: "45", label: "45 min" },
    { value: "60", label: "1 heure" },
    { value: "90", label: "1h30" },
];

const initialState: RdvFormState = { success: false, message: "" };

// ─── Composant principal ──────────────────────────────────────────────────────
export default function AgendaClient({ initialEvents, patients, stats }: Props) {
    const router = useRouter();
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());
    const [events] = useState<CalendarEvent[]>(
        initialEvents.map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))
    );

    // Modal "Nouveau RDV"
    const [isOpen, setIsOpen]             = useState(false);
    const [modalKey, setModalKey]         = useState(0);
    const [state, setState]               = useState<RdvFormState>(initialState);
    const [isLoading, setIsLoading]       = useState(false);
    const [selectedType, setSelectedType] = useState<RdvTypeValue>("CONSULTATION");
    const [prefilledDate, setPrefilledDate] = useState(new Date().toISOString().split("T")[0]);
    const [prefilledTime, setPrefilledTime] = useState("09:00");

    // Patient search
    const [search, setSearch]                   = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showDropdown, setShowDropdown]       = useState(false);
    const [isNewPatient, setIsNewPatient]       = useState(false);
    const [newPatientInfo, setNewPatientInfo]   = useState({ nom: "", prenom: "" });

    // IA RDV
    const [aiText, setAiText]               = useState("");
    const [aiLoading, setAiLoading]         = useState(false);
    const [aiSuggestion, setAiSuggestion]   = useState<string | null>(null);
    const [aiRecording, setAiRecording]     = useState(false);
    const [prefilledMotif, setPrefilledMotif] = useState("");
    const aiRecognitionRef                  = useRef<any>(null);

    // Modal "Détail RDV"
    const [selectedEvent, setSelectedEvent]   = useState<CalendarEvent | null>(null);
    const [isDetailOpen, setIsDetailOpen]     = useState(false);
    const [confirmCancel, setConfirmCancel]   = useState(false);

    const formRef    = useRef<HTMLFormElement>(null);
    const searchRef  = useRef<HTMLDivElement>(null);

    // Fermer le dropdown patient au clic extérieur
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Auto-open modal si ?new=true dans l'URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("new") === "true") {
            const aiDate   = params.get("aiDate");
            const aiTime   = params.get("aiTime");
            const aiType   = params.get("aiType") as RdvTypeValue | null;
            const aiMotif  = params.get("aiMotif");
            const aiPatient = params.get("aiPatient");

            openNewModal(aiDate ?? undefined, aiTime ?? undefined);

            if (aiType && RDV_TYPES.some((t) => t.value === aiType)) setSelectedType(aiType);
            if (aiMotif)   setPrefilledMotif(decodeURIComponent(aiMotif));
            if (aiPatient) {
                const name = decodeURIComponent(aiPatient);
                setSearch(name);
                setAiSuggestion(`Pré-rempli par l'IA · ${[aiDate, aiTime, aiType !== "CONSULTATION" ? aiType : null, aiMotif].filter(Boolean).join(" · ")}`);
            }

            const pId = params.get("patientId");
            if (pId) {
                const found = patients.find((p) => p.id === pId);
                if (found) {
                    setSelectedPatient(found);
                    setSearch(`${found.civilite} ${found.nom.toUpperCase()} ${found.prenom}`);
                } else {
                    const pName = params.get("patientName");
                    if (pName) setSearch(decodeURIComponent(pName));
                }
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openNewModal = (d?: string, t?: string) => {
        setPrefilledDate(d ?? new Date().toISOString().split("T")[0]);
        setPrefilledTime(t ?? "09:00");
        setSelectedType("CONSULTATION");
        setSearch("");
        setSelectedPatient(null);
        setIsNewPatient(false);
        setNewPatientInfo({ nom: "", prenom: "" });
        setPrefilledMotif("");
        setAiText("");
        setAiSuggestion(null);
        setState(initialState);
        setModalKey((k) => k + 1);
        setIsOpen(true);
    };

    const handleAiPrefill = async () => {
        if (!aiText.trim()) return;
        setAiLoading(true);
        setAiSuggestion(null);
        try {
            const res = await fetch("/api/ai-rdv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: aiText }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Erreur IA");
            }
            const data = await res.json();

            // Mettre à jour les états AVANT de remonter le formulaire
            if (data.date) setPrefilledDate(data.date);
            if (data.time) setPrefilledTime(data.time);
            if (data.type) setSelectedType(data.type);
            if (data.motif) setPrefilledMotif(data.motif);
            if (data.patientName) {
                setSearch(data.patientName);
                setShowDropdown(true);
            }

            // Remonter le formulaire avec les nouvelles valeurs par défaut
            setModalKey((k) => k + 1);

            // Résumé de ce qui a été pré-rempli
            const parts: string[] = [];
            if (data.patientName) parts.push(`Patient : ${data.patientName}`);
            if (data.date) parts.push(`Date : ${data.date}`);
            if (data.time) parts.push(`Heure : ${data.time}`);
            if (data.type && data.type !== "CONSULTATION") parts.push(`Type : ${data.type}`);
            if (data.motif) parts.push(`Motif : ${data.motif}`);
            setAiSuggestion(parts.length > 0 ? parts.join(" · ") : "Formulaire pré-rempli");
        } catch (err: any) {
            toast.error(err.message || "Impossible d'analyser le texte");
        } finally {
            setAiLoading(false);
        }
    };

    const toggleAiMic = () => {
        if (aiRecording) {
            aiRecognitionRef.current?.stop();
            setAiRecording(false);
            return;
        }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { toast.error("Reconnaissance vocale non supportée. Utilisez Chrome ou Edge."); return; }
        const rec = new SR();
        rec.lang = "fr-FR";
        rec.onresult = (e: any) => {
            const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
            setAiText(transcript);
        };
        rec.onend = () => setAiRecording(false);
        rec.onerror = () => setAiRecording(false);
        aiRecognitionRef.current = rec;
        rec.start();
        setAiRecording(true);
    };

    const closeNewModal = () => {
        setIsOpen(false);
        router.push("/agenda");
    };

    const closeDetailModal = () => {
        setIsDetailOpen(false);
        setSelectedEvent(null);
        setConfirmCancel(false);
    };

    const filteredPatients = patients.filter((p) => {
        const q = search.toLowerCase();
        return p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q);
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setState(initialState);
        const formData = new FormData(e.currentTarget);
        const result = await createRdv(formData);
        setState(result);
        setIsLoading(false);
        if (result.success) {
            toast.success("Rendez-vous créé avec succès !");
            setTimeout(() => {
                closeNewModal();
                router.refresh();
            }, 900);
        }
    };

    const handleCancelRdv = async () => {
        if (!selectedEvent) return;
        setIsLoading(true);
        try {
            const res = await cancelRdv(selectedEvent.id);
            if (res.success) {
                toast.success(res.message);
                closeDetailModal();
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch {
            toast.error("Erreur lors de l'annulation");
        } finally {
            setIsLoading(false);
        }
    };

    const eventStyleGetter = (event: any) => {
        const s = TYPE_STYLE[event.type] ?? { bg: "#f1f5f9", color: "#334155" };
        return {
            style: {
                backgroundColor: s.bg,
                color: s.color,
                border: `1px solid ${s.color}33`,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "12px",
                padding: "2px 6px",
            },
        };
    };

    // Countdown pour stats header
    const nextRdvLabel = stats.nextRdv
        ? (() => {
            const d = new Date(stats.nextRdv);
            const mins = differenceInMinutes(d, new Date());
            if (mins < 0)  return "En cours";
            if (mins < 60) return `Dans ${mins} min`;
            return `À ${format(d, "HH:mm")}`;
        })()
        : null;

    // Navigation selon la vue courante
    const navigate = (dir: -1 | 1) => {
        const d = new Date(date);
        if (view === Views.MONTH)      d.setMonth(d.getMonth() + dir);
        else if (view === Views.WEEK)  d.setDate(d.getDate() + dir * 7);
        else                           d.setDate(d.getDate() + dir);
        setDate(d);
    };

    const inputClass  = "block w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 bg-slate-50 placeholder:text-slate-400";
    const labelClass  = "block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-widest";
    const errorClass  = "text-xs text-red-600 mt-1";

    return (
        <div className="space-y-4 pb-8">
            {/* ══════════════════════════════════════════
                HEADER
            ══════════════════════════════════════════ */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Agenda</h1>
                    <p className="text-sm text-slate-400 mt-0.5 capitalize">
                        {format(date, "MMMM yyyy", { locale: fr })}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-sm font-black text-slate-900">{stats.today}</span>
                        <span className="text-xs text-slate-500">aujourd&apos;hui</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-sm font-black text-slate-900">{stats.week}</span>
                        <span className="text-xs text-slate-500">cette semaine</span>
                    </div>
                    {nextRdvLabel && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 border border-violet-100 rounded-xl">
                            <Clock className="h-3.5 w-3.5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-700">Prochain : {nextRdvLabel}</span>
                        </div>
                    )}
                    <button onClick={() => openNewModal()}
                        className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-violet-100">
                        <Plus className="h-4 w-4" /> Nouveau RDV
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                BARRE DE NAVIGATION
            ══════════════════════════════════════════ */}
            <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
                <div className="flex items-center gap-2">
                    <button onClick={() => setDate(new Date())}
                        className="px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        Aujourd&apos;hui
                    </button>
                    <button onClick={() => navigate(-1)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => navigate(1)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {[
                        { v: Views.DAY,    label: "Jour",     icon: CalendarDays },
                        { v: Views.WEEK,   label: "Semaine",  icon: LayoutGrid },
                        { v: Views.MONTH,  label: "Mois",     icon: CalendarCheck },
                        { v: Views.AGENDA, label: "Planning", icon: List },
                    ].map(({ v, label, icon: Icon }) => (
                        <button key={v} onClick={() => setView(v as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                            <Icon className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════
                CALENDRIER
            ══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <style dangerouslySetInnerHTML={{ __html: `
                    .rbc-toolbar { display: none; }
                    .rbc-time-view, .rbc-month-view { border: none; }
                    .rbc-header { padding: 10px 8px; font-weight: 700; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.05em; }
                    .rbc-today { background-color: #f5f3ff !important; }
                    .rbc-today .rbc-header { color: #7c3aed; }
                    .rbc-time-content { border-top: 1px solid #f1f5f9; }
                    .rbc-timeslot-group { border-bottom: 1px solid #f8fafc; min-height: 48px; }
                    .rbc-time-slot { border-top: none; }
                    .rbc-label { font-size: 11px; color: #94a3b8; font-weight: 600; padding-right: 8px; }
                    .rbc-current-time-indicator { background-color: #7c3aed; height: 2px; }
                    .rbc-event:focus { outline: 2px solid #7c3aed; outline-offset: 2px; }
                    .rbc-day-slot .rbc-time-slot { border-top: 1px dashed #f1f5f9; }
                    .rbc-off-range-bg { background-color: #fafafa; }
                    .rbc-date-cell { padding: 6px 8px; font-size: 12px; font-weight: 600; color: #64748b; }
                    .rbc-date-cell.rbc-now { color: #7c3aed; font-weight: 800; }
                    .rbc-month-row { border-color: #f1f5f9; }
                    .rbc-day-bg + .rbc-day-bg { border-color: #f1f5f9; }
                    .rbc-agenda-view table { border-color: #f1f5f9; }
                    .rbc-agenda-date-cell, .rbc-agenda-time-cell { font-size: 12px; color: #64748b; font-weight: 600; }
                    .rbc-slot-selection { background: #ede9fe80; border: 1px solid #7c3aed; border-radius: 4px; }
                    .rbc-show-more { color: #7c3aed; font-weight: 700; font-size: 11px; }
                    .rbc-event { cursor: pointer; }
                    .rbc-event:hover { filter: brightness(0.96); }
                ` }} />
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 640, padding: "0 4px 8px" }}
                    culture="fr"
                    toolbar={false}
                    messages={{
                        next: "Suivant", previous: "Précédent", today: "Aujourd'hui",
                        month: "Mois", week: "Semaine", day: "Jour", agenda: "Planning",
                        noEventsInRange: "Aucun rendez-vous sur cette période",
                        showMore: (n: number) => `+${n} de plus`,
                    }}
                    view={view}
                    onView={(v) => setView(v as any)}
                    date={date}
                    onNavigate={(d) => setDate(d)}
                    onSelectEvent={(event) => {
                        setSelectedEvent(event as CalendarEvent);
                        setConfirmCancel(false);
                        setIsDetailOpen(true);
                    }}
                    eventPropGetter={eventStyleGetter}
                    min={new Date(0, 0, 0, 7, 0, 0)}
                    max={new Date(0, 0, 0, 20, 0, 0)}
                    selectable
                    onSelectSlot={(slot) => {
                        const slotStart = new Date(slot.start);
                        openNewModal(
                            format(slotStart, "yyyy-MM-dd"),
                            format(slotStart, "HH:mm")
                        );
                    }}
                    step={15}
                    timeslots={4}
                    formats={{
                        timeGutterFormat: (d: Date) => format(d, "HH:mm"),
                        dayFormat:        (d: Date) => format(d, "EEE d", { locale: fr }),
                        dayHeaderFormat:  (d: Date) => format(d, "EEEE d MMMM", { locale: fr }),
                        agendaDateFormat: (d: Date) => format(d, "EEE d MMM", { locale: fr }),
                    }}
                />
            </div>

            {/* ══════════════════════════════════════════
                LÉGENDE
            ══════════════════════════════════════════ */}
            <div className="flex items-center gap-5 flex-wrap px-1">
                {RDV_TYPES.map(({ value, label }) => (
                    <div key={value} className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${TYPE_STYLE[value].dot}`} />
                        <span className="text-xs text-slate-500 font-medium">{label}</span>
                    </div>
                ))}
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-400 italic">Cliquez sur un créneau pour créer un RDV</span>
            </div>

            {/* ══════════════════════════════════════════
                MODAL DÉTAILS RDV
            ══════════════════════════════════════════ */}
            {isDetailOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDetailModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* En-tête coloré par type */}
                        <div
                            className="px-6 pt-6 pb-5 flex items-start justify-between gap-4"
                            style={{ backgroundColor: TYPE_STYLE[selectedEvent.type]?.bg ?? "#f8fafc" }}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${TYPE_STYLE[selectedEvent.type]?.dot ?? "bg-slate-400"}`} />
                                    <span className="text-xs font-black uppercase tracking-widest"
                                        style={{ color: TYPE_STYLE[selectedEvent.type]?.color ?? "#334155" }}>
                                        {RDV_TYPES.find((t) => t.value === selectedEvent.type)?.label ?? selectedEvent.type}
                                    </span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        {selectedEvent.source === "ONLINE"
                                            ? <><Globe className="h-3 w-3" /> En ligne</>
                                            : <><Phone className="h-3 w-3" /> Téléphone</>}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-slate-900 leading-tight">
                                    {selectedEvent.patientCivilite} {selectedEvent.patientNom.toUpperCase()} {selectedEvent.patientPrenom}
                                </h2>
                            </div>
                            <button onClick={closeDetailModal}
                                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-black/5 text-slate-400 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Date / Heure / Durée */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
                                    <p className="text-sm font-black text-slate-800">
                                        {format(selectedEvent.start, "d MMM", { locale: fr })}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        {format(selectedEvent.start, "yyyy")}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Heure</p>
                                    <p className="text-sm font-black text-slate-800">{format(selectedEvent.start, "HH:mm")}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">→ {format(selectedEvent.end, "HH:mm")}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Durée</p>
                                    <p className="text-sm font-black text-slate-800">{selectedEvent.duree} min</p>
                                </div>
                            </div>

                            {/* Motif */}
                            {selectedEvent.motif && (
                                <div className="px-4 py-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Motif</p>
                                    <p className="text-sm text-slate-700 font-medium">{selectedEvent.motif}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2 pt-1">
                                <Link href={`/patients/${selectedEvent.patientId}`}
                                    className="flex items-center justify-between w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors font-bold text-sm"
                                    onClick={closeDetailModal}>
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" /> Ouvrir le dossier patient
                                    </span>
                                    <ExternalLink className="h-4 w-4 opacity-70" />
                                </Link>

                                {!confirmCancel ? (
                                    <button onClick={() => setConfirmCancel(true)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-white text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors font-bold text-sm">
                                        <Trash2 className="h-4 w-4" /> Annuler ce rendez-vous
                                    </button>
                                ) : (
                                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-3">
                                        <p className="text-sm font-black text-red-700">Confirmer l&apos;annulation ?</p>
                                        <p className="text-xs text-red-400">Le patient sera notifié par SMS et email.</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setConfirmCancel(false)}
                                                className="flex-1 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                                Non, garder
                                            </button>
                                            <button onClick={handleCancelRdv} disabled={isLoading}
                                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                                                {isLoading
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <Trash2 className="h-3.5 w-3.5" />}
                                                Oui, annuler
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                MODAL NOUVEAU RDV
            ══════════════════════════════════════════ */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeNewModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[92vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                                    <CalendarPlus className="h-5 w-5 text-violet-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-900">Nouveau Rendez-vous</h2>
                                    <p className="text-xs text-slate-400 font-medium">Planifier un créneau pour un patient</p>
                                </div>
                            </div>
                            <button onClick={closeNewModal}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Zone IA — dictée ou texte libre */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-violet-50/40 space-y-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                                <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Assistant IA — Prise de RDV rapide</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={aiText}
                                        onChange={(e) => setAiText(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAiPrefill()}
                                        placeholder='Ex: "RDV Mme Diallo demain à 14h pour suivi grossesse"'
                                        className="w-full bg-white border border-violet-200 rounded-xl px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleAiMic}
                                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors ${aiRecording ? "text-red-500" : "text-slate-400 hover:text-violet-500"}`}
                                        title={aiRecording ? "Arrêter" : "Dicter"}
                                    >
                                        {aiRecording
                                            ? <MicOff className="h-4 w-4" />
                                            : <Mic className="h-4 w-4" />}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAiPrefill}
                                    disabled={!aiText.trim() || aiLoading}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-black rounded-xl transition-all whitespace-nowrap"
                                >
                                    {aiLoading
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Sparkles className="h-3.5 w-3.5" />}
                                    Analyser
                                </button>
                            </div>
                            {aiSuggestion && (
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                    <p className="text-xs text-emerald-700 font-medium">{aiSuggestion}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form key={modalKey} ref={formRef} onSubmit={handleSubmit} id="new-rdv-form" className="space-y-5">
                                {state.message && (
                                    <div className={`p-3 rounded-xl text-sm font-medium border ${state.success ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                                        {state.message}
                                    </div>
                                )}

                                {/* Type RDV — pills */}
                                <div>
                                    <label className={labelClass}>Type de RDV</label>
                                    <div className="flex flex-wrap gap-2">
                                        {RDV_TYPES.map(({ value, label, icon: Icon }) => {
                                            const ts = TYPE_STYLE[value];
                                            const isSel = selectedType === value;
                                            return (
                                                <label key={value}
                                                    className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${isSel ? ts.pillSel : ts.pill}`}>
                                                    <input type="radio" name="type" value={value}
                                                        checked={isSel}
                                                        onChange={() => setSelectedType(value as RdvTypeValue)}
                                                        className="sr-only" />
                                                    <Icon className="h-3 w-3" />
                                                    {label}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Patient */}
                                <div ref={searchRef} className="relative">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className={labelClass}>Patient *</label>
                                        <button type="button"
                                            onClick={() => {
                                                setIsNewPatient(!isNewPatient);
                                                setSelectedPatient(null);
                                                setSearch("");
                                            }}
                                            className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">
                                            {isNewPatient ? "← Patient existant" : "+ Nouveau patient"}
                                        </button>
                                    </div>

                                    {!isNewPatient ? (
                                        <>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher par nom ou prénom…"
                                                    value={search}
                                                    onChange={(e) => {
                                                        setSearch(e.target.value);
                                                        setShowDropdown(true);
                                                        if (!e.target.value) setSelectedPatient(null);
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    className={`${inputClass} ${selectedPatient ? "border-violet-300 bg-violet-50" : ""}`}
                                                    autoComplete="off"
                                                />
                                                {selectedPatient && (
                                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500" />
                                                )}
                                            </div>
                                            <input type="hidden" name="patientId" value={selectedPatient?.id ?? ""} />
                                            {showDropdown && search && !selectedPatient && (
                                                <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                                                    {filteredPatients.length === 0 ? (
                                                        <div className="px-4 py-4 text-sm text-slate-500 text-center space-y-2">
                                                            <p>Aucun résultat pour &ldquo;{search}&rdquo;</p>
                                                            <button type="button"
                                                                onClick={() => {
                                                                    setIsNewPatient(true);
                                                                    const parts = search.split(" ");
                                                                    setNewPatientInfo({ nom: parts[0] ?? "", prenom: parts.slice(1).join(" ") });
                                                                    setShowDropdown(false);
                                                                }}
                                                                className="text-xs text-violet-600 font-bold hover:underline">
                                                                Créer une nouvelle fiche →
                                                            </button>
                                                        </div>
                                                    ) : filteredPatients.map((p) => (
                                                        <button key={p.id} type="button"
                                                            onClick={() => {
                                                                setSelectedPatient(p);
                                                                setSearch(`${p.civilite} ${p.nom.toUpperCase()} ${p.prenom}`);
                                                                setShowDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-violet-50 hover:text-violet-700 transition-colors border-b border-slate-50 last:border-0">
                                                            <span className="font-bold">{p.civilite} {p.nom.toUpperCase()} {p.prenom}</span>
                                                            {p.telephone && (
                                                                <span className="text-xs text-slate-400 ml-2">{p.telephone}</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {state.errors?.patientId && <p className={errorClass}>{state.errors.patientId[0]}</p>}
                                        </>
                                    ) : (
                                        <div className="space-y-3 bg-violet-50 p-4 rounded-xl border border-violet-100">
                                            <input type="hidden" name="isNewPatient" value="true" />
                                            <div className="grid grid-cols-3 gap-2">
                                                <select name="new_civilite" className={inputClass}>
                                                    <option value="MME">Mme</option>
                                                    <option value="MLLE">Mlle</option>
                                                    <option value="M">M.</option>
                                                </select>
                                                <input name="new_nom" placeholder="Nom *" required
                                                    className={`${inputClass} col-span-2`}
                                                    defaultValue={newPatientInfo.nom} />
                                            </div>
                                            <input name="new_prenom" placeholder="Prénom *" required
                                                className={inputClass}
                                                defaultValue={newPatientInfo.prenom} />
                                            <input name="new_telephone" placeholder="Téléphone" className={inputClass} />
                                        </div>
                                    )}
                                </div>

                                {/* Date + Heure */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="date" className={labelClass}>Date *</label>
                                        <input id="date" name="date" type="date" required
                                            defaultValue={prefilledDate}
                                            className={inputClass} />
                                        {state.errors?.date && <p className={errorClass}>{state.errors.date[0]}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="heureDebut" className={labelClass}>Heure *</label>
                                        <input id="heureDebut" name="heureDebut" type="time" required
                                            defaultValue={prefilledTime}
                                            className={inputClass} />
                                        {state.errors?.heureDebut && <p className={errorClass}>{state.errors.heureDebut[0]}</p>}
                                    </div>
                                </div>

                                {/* Durée — pills */}
                                <div>
                                    <label className={labelClass}>Durée</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {DUREES.map((d) => (
                                            <label key={d.value}
                                                className="cursor-pointer flex items-center px-3 py-1.5 rounded-full border text-xs font-bold transition-all has-[:checked]:bg-slate-700 has-[:checked]:text-white has-[:checked]:border-transparent bg-white border-slate-200 text-slate-600 hover:border-slate-400">
                                                <input type="radio" name="duree" value={d.value}
                                                    defaultChecked={d.value === "30"}
                                                    className="sr-only" />
                                                {d.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Motif */}
                                <div>
                                    <label htmlFor="motif" className={labelClass}>Motif</label>
                                    <textarea id="motif" name="motif" rows={2}
                                        className={inputClass}
                                        defaultValue={prefilledMotif}
                                        placeholder="Douleurs, suivi post-op, contrôle de grossesse…" />
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                            <button type="button" onClick={closeNewModal}
                                className="px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                Annuler
                            </button>
                            <button type="submit" form="new-rdv-form" disabled={isLoading}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-lg shadow-violet-100">
                                {isLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</>
                                    : <><CalendarPlus className="h-4 w-4" /> Créer le RDV</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
