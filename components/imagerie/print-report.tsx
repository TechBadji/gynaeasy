"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity } from "lucide-react";

interface PrintReportProps {
    scan: any;
    reportText: string;
    reportMeta: any;
    doctorName: string;
    specialite: string;
    clinicInfo?: any;
}

export default function ImagingPrintTemplate({ scan, reportText, reportMeta, doctorName, specialite, clinicInfo }: PrintReportProps) {
    return (
        <div id="imaging-report-print" className="bg-white p-12 text-slate-900 font-serif hidden print:block min-h-screen">
            {/* Header Cabinet */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded-lg">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-indigo-600">{clinicInfo?.nom || "Gynaeasy"}</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{clinicInfo?.slogan || "Clinique de Gynécologie & Obstétrique"}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{doctorName}</p>
                    <p className="text-sm text-slate-600 italic">{specialite}</p>
                    <p className="text-xs text-slate-500 mt-2">
                        {clinicInfo?.adresse || "Dakar, Sénégal"}
                        {clinicInfo?.telephone && ` • ${clinicInfo.telephone}`}
                    </p>
                </div>
            </div>

            {/* Titre Document */}
            <div className="text-center mb-10">
                <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-8">Compte-rendu d'Examen Échographique</h2>
                <p className="text-slate-500 mt-2">Examen réalisé le {format(new Date(scan.createdAt), "PPP", { locale: fr })}</p>
            </div>

            {/* Infos Patient */}
            <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-xl mb-10 border border-slate-100">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patiente</p>
                    <p className="text-lg font-bold uppercase">{scan.patient.nom} {scan.patient.prenom}</p>
                    <p className="text-sm text-slate-600">ID: {scan.patient.codePatient}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type d'examen</p>
                    <p className="text-lg font-bold uppercase text-indigo-900">{scan.nom}</p>
                </div>
            </div>

            {/* Mesures Biométriques */}
            {Object.keys(reportMeta).length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xs font-black uppercase tracking-widest border-l-4 border-slate-900 pl-3 mb-4">Données Biométriques</h3>
                    <div className="grid grid-cols-3 gap-6">
                        {Object.entries(reportMeta).map(([key, val]: any) => (
                            <div key={key} className="border-b border-slate-100 pb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">{key}</span>
                                <span className="text-sm font-bold">{val} mm</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Conclusion */}
            <div className="mb-16">
                <h3 className="text-xs font-black uppercase tracking-widest border-l-4 border-slate-900 pl-3 mb-4">Conclusions et Observations</h3>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-800 italic bg-white p-4 border border-dashed border-slate-200 rounded-lg">
                    {reportText || "Aucune conclusion saisie."}
                </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end mt-auto pt-20">
                <div className="text-[10px] text-slate-400 max-w-[300px]">
                    Ce document est un compte-rendu médical officiel généré par Gynaeasy OS.
                    Validité numérique confirmée.
                </div>
                <div className="text-center border-t border-slate-900 pt-4 w-[200px]">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-8">Signature du Praticien</p>
                    <p className="text-sm font-bold">{doctorName}</p>
                </div>
            </div>
        </div>
    );
}
