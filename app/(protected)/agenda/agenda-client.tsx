"use client";

import { useState, useRef, useEffect } from "react";
import { format, startOfWeek, getDay, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Plus, X, Loader2, CalendarPlus } from "lucide-react";
import { createRdv, type RdvFormState } from "@/app/actions/rdv";

const locales = { fr };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
};

type SerializedEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    type: string;
};

type Patient = {
    id: string;
    nom: string;
    prenom: string;
    civilite: string;
};

type Props = {
    initialEvents: SerializedEvent[];
    patients: Patient[];
};

const RDV_TYPES = [
    { value: "CONSULTATION", label: "Consultation" },
    { value: "ECHOGRAPHIE", label: "Échographie" },
    { value: "SUIVI_GROSSESSE", label: "Suivi de grossesse" },
    { value: "URGENCE", label: "Urgence" },
    { value: "TELECONSULTATION", label: "Téléconsultation" },
];

const DUREES = [
    { value: "15", label: "15 min" },
    { value: "30", label: "30 min" },
    { value: "45", label: "45 min" },
    { value: "60", label: "1 heure" },
    { value: "90", label: "1h30" },
];

const initialState: RdvFormState = { success: false, message: "" };

export default function AgendaClient({ initialEvents, patients }: Props) {
    const [view, setView] = useState(Views.WEEK);
    const [date, setDate] = useState(new Date());
    // Convert ISO strings from the server back to real Date objects
    const [events, setEvents] = useState<CalendarEvent[]>(
        initialEvents.map((e) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end),
        }))
    );
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState<RdvFormState>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Auto-open modal if ?new=true is present in URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("new") === "true") {
            setIsOpen(true);
            
            const pId = params.get("patientId");
            const pName = params.get("patientName");
            if (pId && pName) {
                // On cherche le patient complet dans la liste pour avoir toutes les infos si besoin
                const found = patients.find(p => p.id === pId);
                if (found) {
                    setSelectedPatient(found);
                    setSearch(`${found.civilite} ${found.nom.toUpperCase()} ${found.prenom}`);
                } else {
                    // Fallback si pas encore dans la liste (peu probable)
                    setSearch(decodeURIComponent(pName));
                }
            }
        }
    }, [patients]);

    // Pre-fill date with today
    const todayStr = new Date().toISOString().split("T")[0];

    const filteredPatients = patients.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.nom.toLowerCase().includes(q) || p.prenom.toLowerCase().includes(q)
        );
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
            // Re-fetch by simply reloading after the server rebuilds the page
            setTimeout(() => {
                setIsOpen(false);
                setState(initialState);
                setSelectedPatient(null);
                setSearch("");
                window.location.reload();
            }, 1200);
        }
    };

    const eventStyleGetter = (event: any) => {
        const styles: Record<string, { bg: string; color: string }> = {
            ECHOGRAPHIE: { bg: "#fdf4ff", color: "#a21caf" },
            SUIVI_GROSSESSE: { bg: "#fdf2f8", color: "#be185d" },
            URGENCE: { bg: "#fef2f2", color: "#b91c1c" },
            CONSULTATION: { bg: "#f0fdf4", color: "#15803d" },
            TELECONSULTATION: { bg: "#eff6ff", color: "#1d4ed8" },
        };
        const s = styles[event.type] || { bg: "#f1f5f9", color: "#334155" };
        return {
            style: {
                backgroundColor: s.bg,
                color: s.color,
                border: `1px solid ${s.color}33`,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: "6px",
                fontWeight: "600",
                fontSize: "12px",
            },
        };
    };

    const inputClass =
        "mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";
    const labelClass = "block text-sm font-medium text-slate-700";
    const errorClass = "text-xs text-red-600 mt-1";

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Agenda</h1>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau RDV
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm flex-1 min-h-[600px]">
                <style dangerouslySetInnerHTML={{
                    __html: `
          .rbc-toolbar button { border-radius: 6px; }
          .rbc-toolbar button.rbc-active { background-color: #db2777; color: white; border-color: #db2777; }
          .rbc-btn-group button:hover { background-color: #fce7f3; color: #db2777; }
          .rbc-today { background-color: #fdf2f8; }
          .rbc-time-view, .rbc-month-view { border-color: #e2e8f0; border-radius: 8px; overflow: hidden; }
          .rbc-header { padding: 8px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
          .rbc-time-content { border-top: 1px solid #e2e8f0; }
        `}} />
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    culture="fr"
                    messages={{
                        next: "Suivant",
                        previous: "Précédent",
                        today: "Aujourd'hui",
                        month: "Mois",
                        week: "Semaine",
                        day: "Jour",
                        agenda: "Planning",
                        noEventsInRange: "Aucun rendez-vous sur cette période",
                    }}
                    view={view}
                    onView={(v) => setView(v as any)}
                    date={date}
                    onNavigate={(d) => setDate(d)}
                    eventPropGetter={eventStyleGetter}
                    min={new Date(0, 0, 0, 8, 0, 0)}
                    max={new Date(0, 0, 0, 20, 0, 0)}
                    onSelectSlot={(slot) => {
                        setIsOpen(true);
                    }}
                    selectable
                />
            </div>

            {/* Modal RDV */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100 rounded-lg">
                                    <CalendarPlus className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Nouveau Rendez-vous</h2>
                                    <p className="text-xs text-slate-500">Planifier un RDV pour un patient</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form ref={formRef} onSubmit={handleSubmit} id="new-rdv-form">
                                {state.message && (
                                    <div className={`mb-4 p-3 rounded-md text-sm ${state.success ? "bg-green-50 border-l-4 border-green-500 text-green-700" : "bg-red-50 border-l-4 border-red-500 text-red-700"}`}>
                                        {state.message}
                                    </div>
                                )}

                                {/* Patient search */}
                                <div className="mb-4 relative">
                                    <label className={labelClass}>Patient *</label>
                                    <input
                                        type="text"
                                        placeholder="Rechercher un patient..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setShowDropdown(true);
                                            if (!e.target.value) setSelectedPatient(null);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        className={inputClass}
                                        autoComplete="off"
                                    />
                                    {/* Hidden input for form submission */}
                                    <input type="hidden" name="patientId" value={selectedPatient?.id || ""} />
                                    {showDropdown && search && !selectedPatient && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredPatients.length === 0 ? (
                                                <div className="px-4 py-3 text-sm text-slate-500">Aucun patient trouvé</div>
                                            ) : (
                                                filteredPatients.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedPatient(p);
                                                            setSearch(`${p.civilite} ${p.nom.toUpperCase()} ${p.prenom}`);
                                                            setShowDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-pink-50 hover:text-pink-700"
                                                    >
                                                        {p.civilite} {p.nom.toUpperCase()} {p.prenom}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                    {state.errors?.patientId && <p className={errorClass}>{state.errors.patientId[0]}</p>}
                                </div>

                                {/* Type */}
                                <div className="mb-4">
                                    <label htmlFor="type" className={labelClass}>Type de RDV *</label>
                                    <select name="type" id="type" required className={inputClass}>
                                        {RDV_TYPES.map((t) => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date + Heure */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label htmlFor="date" className={labelClass}>Date *</label>
                                        <input id="date" name="date" type="date" required defaultValue={todayStr} className={inputClass} />
                                        {state.errors?.date && <p className={errorClass}>{state.errors.date[0]}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="heureDebut" className={labelClass}>Heure *</label>
                                        <input id="heureDebut" name="heureDebut" type="time" required defaultValue="09:00" className={inputClass} />
                                        {state.errors?.heureDebut && <p className={errorClass}>{state.errors.heureDebut[0]}</p>}
                                    </div>
                                </div>

                                {/* Durée */}
                                <div className="mb-4">
                                    <label htmlFor="duree" className={labelClass}>Durée</label>
                                    <select name="duree" id="duree" className={inputClass}>
                                        {DUREES.map((d) => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Motif */}
                                <div className="mb-4">
                                    <label htmlFor="motif" className={labelClass}>Motif</label>
                                    <textarea id="motif" name="motif" rows={2} className={inputClass} placeholder="Motif du rendez-vous..." />
                                </div>
                            </form>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t bg-slate-50 rounded-b-xl">
                            <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                                Annuler
                            </button>
                            <button type="submit" form="new-rdv-form" disabled={isLoading} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 disabled:opacity-50">
                                {isLoading ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</>
                                ) : (
                                    <><CalendarPlus className="h-4 w-4 mr-2" />Créer le RDV</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
