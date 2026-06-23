"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
    Search, Plus, FileImage, History, Activity, User,
    Calendar, ArrowRight, Printer, ClipboardList,
    AlertCircle, CheckCircle2, Clock, X, Loader2, Stethoscope, Upload,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { saveImagingReport, createImagingExam, saveImagingCliche } from "@/app/actions/imaging";
import { consumeStockItem } from "@/app/actions/stock";
import ImagingPrintTemplate from "./print-report";
import { useSession } from "next-auth/react";
import { useUploadThing } from "@/lib/uploadthing";

const EXAM_TYPES = [
    { value: "Écho Obstétricale T1", label: "Écho Obstétricale — 1er Trimestre" },
    { value: "Écho Obstétricale T2", label: "Écho Obstétricale — 2e Trimestre" },
    { value: "Écho Obstétricale T3", label: "Écho Obstétricale — 3e Trimestre" },
    { value: "Écho Pelvienne", label: "Échographie Pelvienne" },
    { value: "Écho Endovaginale", label: "Échographie Endovaginale" },
    { value: "Écho Mammaire", label: "Échographie Mammaire" },
    { value: "Écho Abdominale", label: "Échographie Abdominale" },
];

const TEMPLATES: Record<string, { label: string; fields: { id: string; label: string; unit: string }[]; defaultConclusion: string }> = {
    "Écho Obstétricale T1": {
        label: "T1 (8–13 SA)",
        fields: [
            { id: "longueur_cn", label: "LCC (mm)", unit: "mm" },
            { id: "cn", label: "Clarté Nucale (mm)", unit: "mm" },
            { id: "fcf", label: "FCF (bpm)", unit: "bpm" },
            { id: "sa", label: "Âge gestationnel (SA)", unit: "SA" },
        ],
        defaultConclusion: "Grossesse intra-utérine évolutive. Embryon normoconformé. Rythme cardiaque fœtal régulier. Clarté nucale dans les limites de la normale."
    },
    "Écho Obstétricale T2": {
        label: "T2 (20–24 SA)",
        fields: [
            { id: "bip", label: "BIP (mm)", unit: "mm" },
            { id: "pc", label: "Périmètre Crânien (mm)", unit: "mm" },
            { id: "pa", label: "Périmètre Abdominal (mm)", unit: "mm" },
            { id: "lf", label: "Longueur Fémur (mm)", unit: "mm" },
            { id: "lp", label: "Longueur Pied (mm)", unit: "mm" },
            { id: "sa", label: "Âge gestationnel (SA)", unit: "SA" },
        ],
        defaultConclusion: "Morphologie fœtale sans anomalie décelable. Biométries concordantes avec l'âge gestationnel. Placenta normo-inséré. Quantité de liquide amniotique normale."
    },
    "Écho Obstétricale T3": {
        label: "T3 (30–36 SA)",
        fields: [
            { id: "bip", label: "BIP (mm)", unit: "mm" },
            { id: "pc", label: "Périmètre Crânien (mm)", unit: "mm" },
            { id: "pa", label: "Périmètre Abdominal (mm)", unit: "mm" },
            { id: "lf", label: "Longueur Fémur (mm)", unit: "mm" },
            { id: "poids_estime", label: "Poids estimé (g)", unit: "g" },
            { id: "sa", label: "Âge gestationnel (SA)", unit: "SA" },
        ],
        defaultConclusion: "Fœtus en présentation céphalique. Biométries cohérentes avec l'âge gestationnel. Mouvements actifs. Placenta normo-inséré grade I. Liquide amniotique en quantité normale."
    },
    "Écho Pelvienne": {
        label: "Pelvienne",
        fields: [
            { id: "uterus_long", label: "Utérus Longueur (mm)", unit: "mm" },
            { id: "uterus_larg", label: "Utérus Largeur (mm)", unit: "mm" },
            { id: "endometre", label: "Endomètre (mm)", unit: "mm" },
            { id: "ovaire_d", label: "Ovaire Droit (mm)", unit: "mm" },
            { id: "ovaire_g", label: "Ovaire Gauche (mm)", unit: "mm" },
        ],
        defaultConclusion: "Utérus en antéversion de taille normale. Endomètre régulier. Ovaires de taille normale. Pas d'épanchement intra-péritonéal. Annexes sans image suspecte."
    },
    "Écho Endovaginale": {
        label: "Endovaginale",
        fields: [
            { id: "uterus_long", label: "Utérus Longueur (mm)", unit: "mm" },
            { id: "col_long", label: "Col Longueur (mm)", unit: "mm" },
            { id: "endometre", label: "Endomètre (mm)", unit: "mm" },
            { id: "ovaire_d", label: "Ovaire Droit (mm)", unit: "mm" },
            { id: "ovaire_g", label: "Ovaire Gauche (mm)", unit: "mm" },
        ],
        defaultConclusion: "Examen endovaginal : utérus de morphologie normale. Col de longueur conservée. Endomètre régulier. Ovaires visualisés de taille normale. Pas d'anomalie annexielle."
    },
    "Écho Mammaire": {
        label: "Mammaire",
        fields: [
            { id: "taille_lesion", label: "Taille lésion (mm)", unit: "mm" },
            { id: "localisation", label: "Localisation", unit: "" },
        ],
        defaultConclusion: "Seins homogènes sans masse ni microcalcification suspecte. Pas d'adénopathie axillaire. BIRADS 2."
    },
};

type Patient = { id: string; nom: string; prenom: string; codePatient: string; civilite: string };
type Scan = {
    id: string; nom: string; url: string;
    description: string | null; metadata: any; createdAt: Date;
    patient: Patient;
};

export default function ImagingDashboard({
    initialScans, patients, clinicSettings
}: {
    initialScans: Scan[];
    patients: Patient[];
    clinicSettings?: any;
}) {
    const { data: session } = useSession();
    const [scans, setScans] = useState<Scan[]>(initialScans);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedScan, setSelectedScan] = useState<Scan | null>(initialScans[0] || null);

    // Nouveau examen
    const [showNewExam, setShowNewExam] = useState(false);
    const [patientSearch, setPatientSearch] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [showPatientDrop, setShowPatientDrop] = useState(false);
    const [examType, setExamType] = useState(EXAM_TYPES[0].value);
    const [examNotes, setExamNotes] = useState("");
    const [isPending, startTransition] = useTransition();
    const patientInputRef = useRef<HTMLInputElement>(null);
    const patientDropRef = useRef<HTMLDivElement>(null);

    // Upload cliché
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { startUpload } = useUploadThing("imagingUploader", {
        onUploadError: (e) => { toast.error(e.message); setUploading(false); },
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedScan || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            const res = await startUpload([file]);
            if (res?.[0]?.url) {
                await saveImagingCliche(selectedScan.id, res[0].url);
                const url = res[0].url;
                setScans(prev => prev.map(s => s.id === selectedScan.id ? { ...s, url } : s));
                setSelectedScan(prev => prev ? { ...prev, url } : null);
                toast.success("Cliché importé avec succès");
            }
        } catch (e: any) {
            toast.error(e.message || "Erreur lors de l'upload");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Compte-rendu
    const [isReporting, setIsReporting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reportText, setReportText] = useState("");
    const [reportMeta, setReportMeta] = useState<Record<string, string>>({});
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    // Stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const total = scans.length;
    const thisMonth = scans.filter(s => new Date(s.createdAt) >= monthStart).length;
    const withoutReport = scans.filter(s => !s.description).length;

    // Autocomplete patients
    const filteredPatients = patientSearch.trim().length >= 1
        ? patients.filter(p =>
            [p.nom, p.prenom, `${p.nom} ${p.prenom}`, `${p.prenom} ${p.nom}`, p.codePatient]
                .some(v => v.toLowerCase().includes(patientSearch.toLowerCase()))
        ).slice(0, 6)
        : [];

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            if (!patientInputRef.current?.contains(e.target as Node) && !patientDropRef.current?.contains(e.target as Node)) {
                setShowPatientDrop(false);
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const filteredScans = scans.filter(s =>
        s.patient.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.patient.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.patient.codePatient.includes(searchQuery)
    );

    const handleCreateExam = () => {
        if (!selectedPatient) { toast.error("Sélectionnez un patient"); return; }
        startTransition(async () => {
            try {
                const res = await createImagingExam({
                    patientId: selectedPatient.id,
                    nom: examType,
                    notes: examNotes,
                });
                if (res.success) {
                    const newScan = res.document as Scan;
                    setScans(prev => [newScan, ...prev]);
                    setSelectedScan(newScan);
                    setShowNewExam(false);
                    setSelectedPatient(null);
                    setPatientSearch("");
                    setExamNotes("");
                    toast.success("Examen créé — vous pouvez rédiger le compte-rendu");
                }
            } catch (e: any) {
                toast.error(e.message);
            }
        });
    };

    const handleOpenReport = () => {
        if (!selectedScan) return;
        setReportText(selectedScan.description || "");
        setReportMeta(selectedScan.metadata || {});
        const tKey = Object.keys(TEMPLATES).find(k => selectedScan.nom.startsWith(k.replace("Écho ", "Écho ")) || k === selectedScan.nom);
        setSelectedTemplate(tKey || null);
        setIsReporting(true);
    };

    const applyTemplate = (key: string) => {
        setReportText(TEMPLATES[key].defaultConclusion);
        setSelectedTemplate(key);
        setReportMeta({});
    };

    const handleSaveReport = async () => {
        if (!selectedScan) return;
        setSaving(true);
        try {
            const res = await saveImagingReport(selectedScan.id, reportText, reportMeta);
            if (res.success) {
                toast.success("Compte-rendu enregistré");
                await consumeStockItem("Gel Échographie", 1).catch(() => {});
                setScans(prev => prev.map(s => s.id === selectedScan.id ? { ...s, description: reportText, metadata: reportMeta } : s));
                setSelectedScan(prev => prev ? { ...prev, description: reportText, metadata: reportMeta } : null);
                setIsReporting(false);
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const template = selectedTemplate ? TEMPLATES[selectedTemplate] : null;

    return (
        <div className="flex flex-col h-full space-y-6">

            {/* En-tête */}
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Module d'Imagerie</h1>
                    <p className="text-slate-500 text-sm">Gestion des échographies et clichés radiologiques</p>
                </div>
                <button
                    onClick={() => setShowNewExam(true)}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Nouvel Examen
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 no-print">
                {[
                    { label: "Total examens", value: total, icon: FileImage, color: "violet" },
                    { label: "Ce mois", value: thisMonth, icon: Calendar, color: "emerald" },
                    { label: "Sans compte-rendu", value: withoutReport, icon: AlertCircle, color: withoutReport > 0 ? "amber" : "slate" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-100 px-5 py-4 flex items-center gap-4 shadow-sm">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-${color}-50`}>
                            <Icon className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Corps principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 no-print">

                {/* Liste examens */}
                <div className="lg:col-span-4 flex flex-col space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un patient..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[500px]">
                        {filteredScans.length > 0 ? filteredScans.map(scan => (
                            <button
                                key={scan.id}
                                onClick={() => setSelectedScan(scan)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                    selectedScan?.id === scan.id
                                        ? "bg-violet-50 border-violet-200 ring-1 ring-violet-200"
                                        : "bg-white border-slate-100 hover:border-violet-200 hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0">
                                        <p className={`font-bold text-sm truncate ${selectedScan?.id === scan.id ? "text-violet-900" : "text-slate-900"}`}>
                                            {scan.patient.civilite} {scan.patient.prenom} {scan.patient.nom}
                                        </p>
                                        <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                                            #{scan.patient.codePatient}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                        {format(new Date(scan.createdAt), "dd MMM", { locale: fr })}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Stethoscope className="h-3 w-3 text-slate-400 flex-shrink-0" />
                                        <span className="text-xs text-slate-500 truncate">{scan.nom}</span>
                                    </div>
                                    {scan.description
                                        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                        : <Clock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                                    }
                                </div>
                            </button>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3 border-2 border-dashed border-slate-100 rounded-xl">
                                <History className="h-8 w-8 opacity-30" />
                                <p className="text-sm font-medium">
                                    {searchQuery ? "Aucun résultat" : "Aucun examen enregistré"}
                                </p>
                                {!searchQuery && (
                                    <button
                                        onClick={() => setShowNewExam(true)}
                                        className="text-xs text-violet-600 font-semibold hover:underline"
                                    >
                                        Créer le premier examen
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Visualiseur */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                    {selectedScan ? (
                        <div className="bg-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-800 min-h-[480px]">
                            {/* Header */}
                            <div className="bg-slate-800/80 px-6 py-4 flex items-center justify-between border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                                        <User className="h-5 w-5 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">
                                            {selectedScan.patient.civilite} {selectedScan.patient.prenom} {selectedScan.patient.nom}
                                        </h3>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(selectedScan.createdAt), "PPP", { locale: fr })}
                                            </span>
                                            <span>·</span>
                                            <span className="text-violet-400 font-mono">#{selectedScan.patient.codePatient}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                                        selectedScan.description
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    }`}>
                                        {selectedScan.description ? "CR rédigé" : "En attente"}
                                    </span>
                                </div>
                            </div>

                            {/* Image ou zone d'import */}
                            <div className="flex-1 flex items-center justify-center p-8 bg-black relative min-h-[300px]">
                                {selectedScan.url ? (
                                    <>
                                        <img
                                            src={selectedScan.url}
                                            alt={selectedScan.nom}
                                            className="max-h-full max-w-full rounded-lg object-contain"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition-colors"
                                        >
                                            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                            Remplacer
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="flex flex-col items-center gap-4 text-slate-400 hover:text-white group transition-colors cursor-pointer"
                                    >
                                        <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-slate-600 group-hover:border-violet-400 flex items-center justify-center transition-colors">
                                            {uploading
                                                ? <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                                                : <Upload className="h-8 w-8 group-hover:text-violet-400 transition-colors" />
                                            }
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold group-hover:text-white transition-colors">
                                                {uploading ? "Import en cours..." : "Importer un cliché"}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-1">JPEG, PNG, WebP — max 16 Mo</p>
                                        </div>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-800/80 px-6 py-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Type d'examen</span>
                                    <span className="text-xs text-white bg-violet-500/20 px-2 py-0.5 rounded border border-violet-500/30">
                                        {selectedScan.nom.toUpperCase()}
                                    </span>
                                </div>
                                <button
                                    onClick={handleOpenReport}
                                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg"
                                >
                                    <ClipboardList className="h-3.5 w-3.5" />
                                    {selectedScan.description ? "Modifier le compte-rendu" : "Rédiger le compte-rendu"}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 space-y-4 p-12 min-h-[480px]">
                            <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center shadow-lg border border-slate-100">
                                <FileImage className="h-8 w-8 text-slate-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-600">Sélectionnez un examen</p>
                                <p className="text-sm max-w-[250px] mt-1">Choisissez un examen dans la liste ou créez-en un nouveau.</p>
                            </div>
                            <button
                                onClick={() => setShowNewExam(true)}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Nouvel examen
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Nouvel Examen */}
            {showNewExam && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowNewExam(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md relative z-10">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="h-4 w-4 text-violet-600" />
                                Nouvel Examen
                            </h2>
                            <button onClick={() => setShowNewExam(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Sélection patient */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Patiente *
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <input
                                        ref={patientInputRef}
                                        type="text"
                                        value={selectedPatient ? `${selectedPatient.civilite} ${selectedPatient.prenom} ${selectedPatient.nom}` : patientSearch}
                                        onChange={e => {
                                            setPatientSearch(e.target.value);
                                            setSelectedPatient(null);
                                            setShowPatientDrop(true);
                                        }}
                                        onFocus={() => setShowPatientDrop(true)}
                                        placeholder="Nom ou code patient..."
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                                    />
                                    {showPatientDrop && filteredPatients.length > 0 && !selectedPatient && (
                                        <div ref={patientDropRef} className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                                            {filteredPatients.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPatient(p);
                                                        setPatientSearch("");
                                                        setShowPatientDrop(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2.5 hover:bg-violet-50 text-sm border-b border-slate-50 last:border-0 flex items-center gap-3"
                                                >
                                                    <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                        <User className="h-3 w-3 text-violet-600" />
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-slate-900">{p.civilite} {p.prenom} {p.nom}</span>
                                                        <span className="text-xs text-violet-500 font-mono ml-2">#{p.codePatient}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {selectedPatient && (
                                    <div className="mt-2 flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-violet-600 flex-shrink-0" />
                                        <span className="font-medium text-violet-900">{selectedPatient.civilite} {selectedPatient.prenom} {selectedPatient.nom}</span>
                                        <button onClick={() => { setSelectedPatient(null); setPatientSearch(""); }} className="ml-auto text-violet-400 hover:text-violet-600">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Type d'examen */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Type d'examen *
                                </label>
                                <select
                                    value={examType}
                                    onChange={e => setExamType(e.target.value)}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 bg-white"
                                >
                                    {EXAM_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Notes initiales (optionnel)
                                </label>
                                <textarea
                                    rows={3}
                                    value={examNotes}
                                    onChange={e => setExamNotes(e.target.value)}
                                    placeholder="Motif de l'examen, observations préliminaires..."
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowNewExam(false)}
                                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateExam}
                                disabled={!selectedPatient || isPending}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                Créer l'examen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Compte-rendu */}
            {isReporting && selectedScan && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsReporting(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-800">Compte-rendu d'examen</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {selectedScan.patient.civilite} {selectedScan.patient.prenom} {selectedScan.patient.nom} · {selectedScan.nom}
                                </p>
                            </div>
                            <button onClick={() => setIsReporting(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Templates */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modèle de rapport</label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(TEMPLATES).map(([key, t]) => (
                                        <button
                                            key={key}
                                            onClick={() => applyTemplate(key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                                selectedTemplate === key
                                                    ? "bg-violet-600 text-white border-violet-600"
                                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600"
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mesures biométriques */}
                            {template && template.fields.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <p className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Données biométriques</p>
                                    {template.fields.map(f => (
                                        <div key={f.id}>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                                                {f.label}
                                            </label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={reportMeta[f.id] || ""}
                                                    onChange={e => setReportMeta(prev => ({ ...prev, [f.id]: e.target.value }))}
                                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                                    placeholder="—"
                                                />
                                                {f.unit && <span className="text-xs text-slate-400 w-8">{f.unit}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Conclusion */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conclusion médicale</label>
                                <textarea
                                    rows={6}
                                    value={reportText}
                                    onChange={e => setReportText(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-none"
                                    placeholder="Saisissez vos conclusions..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 rounded-b-2xl">
                            {selectedScan.description && (
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Printer className="h-4 w-4" />
                                    Imprimer
                                </button>
                            )}
                            <div className="flex gap-3 ml-auto">
                                <button onClick={() => setIsReporting(false)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveReport}
                                    disabled={saving || !reportText.trim()}
                                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                    Enregistrer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template impression */}
            {selectedScan && (
                <ImagingPrintTemplate
                    scan={selectedScan}
                    reportText={reportText}
                    reportMeta={reportMeta}
                    doctorName={session?.user?.name || "Médecin"}
                    specialite={(session?.user as any)?.specialite || "Spécialiste Gynaeasy"}
                    clinicInfo={clinicSettings}
                />
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                @media print {
                    .no-print, nav, aside, header { display: none !important; }
                    div#imaging-report-print { display: block !important; position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
}
