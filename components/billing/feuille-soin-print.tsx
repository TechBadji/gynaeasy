"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FeuilleSoinProps {
    invoice: any;
    clinicInfo: any;
}

export default function FeuilleSoinPrint({ invoice, clinicInfo }: FeuilleSoinProps) {
    if (!invoice) return null;

    const { consultation } = invoice;
    if (!consultation) return null;
    
    const { patient, user: doctor } = consultation;
    if (!patient || !doctor) return null;

    const dateSoin = consultation.dateHeure ? new Date(consultation.dateHeure) : new Date();
    const datePaiement = invoice.dateReglement ? new Date(invoice.dateReglement) : new Date();

    return (
        <div id="feuille-soin-print" className="bg-white p-16 text-slate-900 font-serif hidden print:block min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-indigo-600">{clinicInfo?.nom || "Gynaeasy"}</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{clinicInfo?.slogan || "Logiciel de Gestion Spécialisée"}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg">{doctor.name}</p>
                    <p className="text-sm text-slate-600 italic">Gynécologue Obstétricien</p>
                    <p className="text-xs text-slate-500 mt-1">{clinicInfo?.adresse || "Dakar, Sénégal"}</p>
                    {clinicInfo?.telephone && <p className="text-[10px] text-slate-400">Tél: {clinicInfo.telephone}</p>}
                </div>
            </div>

            {/* Titre */}
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black uppercase tracking-tight">Feuille de Soins</h2>
                <p className="text-slate-500">Facture N° {invoice.id.slice(-8).toUpperCase()}</p>
            </div>

            {/* Informations Patiente */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-1">Bénéficiaire des soins</h3>
                    <div>
                        <p className="text-lg font-bold uppercase">{patient.nom} {patient.prenom}</p>
                        <p className="text-sm text-slate-600 tracking-tight">Identifiant Patient: {patient.codePatient}</p>
                    </div>
                </div>
                <div className="space-y-4 text-right">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-1">Date de l'acte</h3>
                    <p className="text-lg font-bold">{format(dateSoin, "PPP", { locale: fr })}</p>
                </div>
            </div>

            {/* Détails CCAM */}
            <div className="mb-12">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-2 text-left text-xs font-black uppercase tracking-widest">Code Acte</th>
                            <th className="py-2 text-left text-xs font-black uppercase tracking-widest">Désignation</th>
                            <th className="py-2 text-right text-xs font-black uppercase tracking-widest">Montant</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="border-b border-slate-100">
                            <td className="py-4 font-mono text-sm">JQMD001</td>
                            <td className="py-4 text-sm font-medium">{consultation.type} - Acte principal</td>
                            <td className="py-4 text-right font-bold">{formatCurrency(invoice.montant)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={2} className="py-6 text-right font-bold text-slate-500">Total à régler</td>
                            <td className="py-6 text-right text-xl font-black">{formatCurrency(invoice.montant)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Paiement */}
            <div className="bg-slate-50 p-6 rounded-2xl mb-12 border border-slate-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mode de règlement</p>
                        <p className="font-bold">{invoice.mode}</p>
                    </div>
                    <div className="text-right text-emerald-600 font-bold flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        AQUITTÉE LE {format(datePaiement, "dd/MM/yyyy")}
                    </div>
                </div>
            </div>

            {/* Footer Signature */}
            <div className="flex justify-between items-end pt-24">
                <div className="max-w-xs text-[9px] text-slate-400 leading-relaxed italic">
                    Cette feuille de soin est générée électroniquement par le système Gynaeasy.
                    Conforme aux normes de facturation médicale en vigueur.
                </div>
                <div className="text-center w-64">
                    <div className="h-0.5 bg-slate-200 mb-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-12">Signature et Cachet</p>
                    <p className="font-bold text-sm uppercase">{doctor.name}</p>
                </div>
            </div>
        </div>
    );
}
