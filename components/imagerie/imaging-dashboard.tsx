"use client";

import { useState } from "react";
import {
    Search,
    Upload,
    FileImage,
    Maximize2,
    Download,
    History,
    Activity,
    User,
    Calendar,
    ArrowRight,
    Printer
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { saveImagingReport } from "@/app/actions/imaging";
import { consumeStockItem } from "@/app/actions/stock";
import ImagingPrintTemplate from "./print-report";
import { useSession } from "next-auth/react";

interface Scan {
    id: string;
    nom: string;
    url: string;
    description: string | null;
    metadata: any;
    createdAt: Date;
    patient: {
        nom: string;
        prenom: string;
        codePatient: string;
    };
}

const TEMPLATES = {
    OBSTETRIQUE_T1: {
        label: "Écho Obstétricale T1",
        fields: [
            { id: "bpd", label: "BIP (mm)", type: "number" },
            { id: "hc", label: "Périmètre Crânien (mm)", type: "number" },
            { id: "ac", label: "Périmètre Abdomimal (mm)", type: "number" },
            { id: "fl", label: "Fémur (mm)", type: "number" },
        ],
        defaultConclusion: "Grossesse intra-utérine évolutive de [X] semaines. Rythme cardiaque fœtal régulier. Morphologie fœtale sans particularité."
    },
    PELVIENNE: {
        label: "Écho Pelvienne",
        fields: [
            { id: "uterus_long", label: "Utérus Longueur (mm)", type: "number" },
            { id: "endometre", label: "Endomètre (mm)", type: "number" },
            { id: "ovaire_d", label: "Ovaire Droit (mm)", type: "number" },
            { id: "ovaire_g", label: "Ovaire Gauche (mm)", type: "number" },
        ],
        defaultConclusion: "Utérus de taille normale. Endomètre régulier. Annexes sans image suspecte."
    }
};

export default function ImagingDashboard({ initialScans, clinicSettings }: { initialScans: any[], clinicSettings?: any }) {
    const { data: session } = useSession();
    const [scans, setScans] = useState<Scan[]>(initialScans);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedScan, setSelectedScan] = useState<Scan | null>(initialScans[0] || null);

    // État du compte-rendu
    const [isReporting, setIsReporting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reportText, setReportText] = useState("");
    const [reportMeta, setReportMeta] = useState<any>({});
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleOpenReport = () => {
        if (!selectedScan) return;
        setReportText(selectedScan.description || "");
        setReportMeta(selectedScan.metadata || {});
        setIsReporting(true);
    };

    const applyTemplate = (key: string) => {
        const t = (TEMPLATES as any)[key];
        setReportText(t.defaultConclusion);
        setSelectedTemplate(key);
    };

    const handleSaveReport = async () => {
        if (!selectedScan) return;
        setSaving(true);
        try {
            const res = await saveImagingReport(selectedScan.id, reportText, reportMeta);
            if (res.success) {
                toast.success("Compte-rendu enregistré");

                // Consommer les stocks par défaut pour une écho
                await consumeStockItem("Gel Échographie", 1);
                await consumeStockItem("Gants Nitrile", 1); // 1 paire

                setScans(prev => prev.map(s => s.id === selectedScan.id ? { ...s, description: reportText, metadata: reportMeta } : s));
                setSelectedScan(prev => prev ? { ...prev, description: reportText, metadata: reportMeta } : null);
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredScans = scans.filter(s =>
        s.patient.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.patient.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.patient.codePatient.includes(searchQuery)
    );

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Module d'Imagerie</h1>
                    <p className="text-slate-500 text-sm">Gestion des échographies et clichés radiologiques</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                        <Upload className="h-4 w-4" />
                        Importer un cliché
                    </button>
                    <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
                        <Activity className="h-4 w-4" />
                        Nouvel Examen
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 no-print">
                {/* Liste latérale des examens */}
                <div className="lg:col-span-4 flex flex-col space-y-4 overflow-hidden">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un patient ou un code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-medium"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {filteredScans.length > 0 ? filteredScans.map((scan) => (
                            <button
                                key={scan.id}
                                onClick={() => setSelectedScan(scan)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedScan?.id === scan.id
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
                                    : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className={`font-bold text-sm ${selectedScan?.id === scan.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                                            {scan.patient.prenom} {scan.patient.nom}
                                        </p>
                                        <p className="text-[10px] font-bold text-indigo-600 mb-1 uppercase tracking-wider">
                                            #{scan.patient.codePatient}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                        {format(new Date(scan.createdAt), "dd MMM yyyy", { locale: fr })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <FileImage className="h-3 w-3 text-slate-400" />
                                    <span className="text-xs text-slate-500 truncate">{scan.nom}</span>
                                </div>
                            </button>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2 italic text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                <History className="h-8 w-8 opacity-20" />
                                <p>Aucun examen trouvé</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Visualiseur principal */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                    {selectedScan ? (
                        <div className="bg-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-800 flex-1 relative min-h-[500px]">
                            {/* Header du visualiseur */}
                            <div className="bg-slate-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <User className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">
                                            {selectedScan.patient.prenom} {selectedScan.patient.nom}
                                        </h3>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(selectedScan.createdAt), "PPP", { locale: fr })}
                                            </span>
                                            <span className="h-1 w-1 rounded-full bg-slate-600" />
                                            <span>ID: {selectedScan.patient.codePatient}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
                                        <Download className="h-4 w-4" />
                                    </button>
                                    <button className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
                                        <Maximize2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Image d'examen */}
                            <div className="flex-1 flex items-center justify-center p-8 bg-black relative group cursor-zoom-in">
                                <img
                                    src={selectedScan.url}
                                    alt={selectedScan.nom}
                                    className="max-h-full max-w-full rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                />
                                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/10 text-[10px] font-mono text-emerald-400 uppercase tracking-tighter">
                                    Live DICOM Render • 60 FPS
                                </div>
                                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-md border border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-tighter">
                                    Zoom: 100% • Rotation: 0°
                                </div>
                            </div>

                            {/* Footer/Actions du visualiseur */}
                            <div className="bg-slate-800/80 backdrop-blur-md px-6 py-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Type d'examen</span>
                                        <span className="text-xs text-white bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">ÉCHOGRAPHIE</span>
                                    </div>
                                    <div className="w-[1px] h-8 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Clichés</span>
                                        <span className="text-xs text-white">4 Images / 1 Rapport</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleOpenReport}
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    Rédiger le compte-rendu
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 space-y-4 p-12">
                            <div className="h-16 w-16 rounded-3xl bg-white flex items-center justify-center shadow-lg border border-slate-100">
                                <FileImage className="h-8 w-8 text-slate-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-600">Sélectionnez un examen</p>
                                <p className="text-sm max-w-[250px] mt-1">Choisissez un patient dans la liste de gauche pour visualiser ses clichés.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Rédaction */}
            {isReporting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsReporting(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800">Compte-rendu d'Examen</h2>
                            <button onClick={() => setIsReporting(false)} className="text-slate-400 hover:text-slate-600 transition-colors px-2 py-1">Fermer</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Templates */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utiliser un modèle</label>
                                <div className="flex gap-2">
                                    {Object.entries(TEMPLATES).map(([key, t]) => (
                                        <button
                                            key={key}
                                            onClick={() => applyTemplate(key)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedTemplate === key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'}`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mesures */}
                            {selectedTemplate && (
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    {(TEMPLATES as any)[selectedTemplate].fields.map((f: any) => (
                                        <div key={f.id}>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{f.label}</label>
                                            <input
                                                type={f.type}
                                                value={reportMeta[f.id] || ""}
                                                onChange={(e) => setReportMeta((prev: any) => ({ ...prev, [f.id]: e.target.value }))}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                placeholder="..."
                                            />
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
                                    onChange={(e) => setReportText(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium min-h-[150px]"
                                    placeholder="Saisissez vos conclusions ici..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                            <button
                                onClick={() => setIsReporting(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSaveReport}
                                disabled={saving}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-2 rounded-lg shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {saving ? "Enregistrement..." : "Enregistrer"}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            {selectedScan?.description && (
                                <button
                                    onClick={handlePrint}
                                    className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg"
                                >
                                    Imprimer
                                    <Printer className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Template d'impression caché à l'écran */}
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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }

                @media print {
                    .no-print, nav, aside, header, .fixed, .grid, .flex, #imaging-report-print + * {
                        display: none !important;
                    }
                    div#imaging-report-print {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}
