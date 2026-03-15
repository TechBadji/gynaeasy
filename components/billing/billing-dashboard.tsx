"use client";

import { useState } from "react";
import {
    Receipt,
    Search,
    Plus,
    Filter,
    Download,
    CheckCircle2,
    Clock,
    CreditCard,
    Banknote,
    FileText,
    ArrowUpRight,
    TrendingUp,
    Activity,
    Printer,
    Smartphone
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { createReglement } from "@/app/actions/billing";
import FeuilleSoinPrint from "./feuille-soin-print";

interface BillingDashboardProps {
    recentInvoices: any[];
    pendingConsultations: any[];
    clinicSettings?: any;
}

export default function BillingDashboard({ recentInvoices, pendingConsultations, clinicSettings }: BillingDashboardProps) {
    const [invoices, setInvoices] = useState(recentInvoices);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
    const [paymentMode, setPaymentMode] = useState<any>("ESPECES");
    const [printingInvoice, setPrintingInvoice] = useState<any>(null);
    const [justPaidInvoice, setJustPaidInvoice] = useState<any>(null);

    const handleOpenPayment = (consultation: any) => {
        setSelectedConsultation(consultation);
        setIsPayModalOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedConsultation) return;

        try {
            const res = await createReglement({
                consultationId: selectedConsultation.id,
                montant: selectedConsultation.honoraire || 25000,
                mode: paymentMode,
            });

            if (res.success) {
                toast.success("Paiement enregistré avec succès");
                // Au lieu de reload tout de suite, on garde la facture pour l'affichage du succès
                setJustPaidInvoice(res.reglement);
                setIsPayModalOpen(false);
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleExportExcel = () => {
        const toastId = toast.loading("Préparation du rapport...");

        try {
            // Transformer les données pour l'export
            const exportData = invoices.map(inv => {
                let formattedDate = "N/A";
                try {
                    if (inv.dateReglement) {
                        formattedDate = format(new Date(inv.dateReglement), "dd/MM/yyyy HH:mm");
                    }
                } catch (e) {
                    console.error("Date error:", e);
                }

                return {
                    "Date": formattedDate,
                    "Patiente": inv.consultation?.patient ? `${inv.consultation.patient.nom.toUpperCase()} ${inv.consultation.patient.prenom}` : "Inconnue",
                    "ID Patient": inv.consultation?.patient?.codePatient || "N/A",
                    "Acte": inv.consultation?.type || "N/A",
                    "Médecin": inv.consultation?.user?.name || "N/A",
                    "Montant (FCFA)": inv.montant || 0,
                    "Mode de paiement": inv.mode === "ORANGE_MONEY" ? "ORANGE MONEY" : (inv.mode || "ESPECES"),
                };
            });

            // Créer le classeur Excel
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Factures");

            // Télécharger le fichier
            const fileName = `Rapport_Activite_${format(new Date(), "ddMMyyyy")}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success("Rapport exporté avec succès", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'exportation", { id: toastId });
        }
    };

    const handlePrintFeuille = (invoice: any) => {
        setPrintingInvoice(invoice);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    const handleDownloadInvoice = async (invoice: any) => {
        const toastId = toast.loading("Génération du PDF...");

        try {
            const { consultation } = invoice;
            const { patient, user: doctor } = consultation;

            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();

            // Configuration des polices et couleurs
            pdf.setTextColor(30, 41, 59); // slate-800

            // Header Clinic
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22);
            pdf.setTextColor(79, 70, 229); // indigo-600
            pdf.text(clinicSettings?.nom || "GYNAEASY CLINIC", 20, 25);

            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139); // slate-500
            pdf.text((clinicSettings?.slogan || "LOGICIEL DE GESTION SPÉCIALISÉE").toUpperCase(), 20, 31);

            // Header Doctor
            pdf.setTextColor(30, 41, 59);
            pdf.setFontSize(12);
            pdf.text(doctor.name, pageWidth - 20, 25, { align: "right" });
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(9);
            pdf.text("Gynécologue Obstétricien", pageWidth - 20, 30, { align: "right" });
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.text(clinicSettings?.adresse || "Dakar, Sénégal", pageWidth - 20, 35, { align: "right" });

            // Ligne de séparation
            pdf.setDrawColor(226, 232, 240); // slate-200
            pdf.line(20, 45, pageWidth - 20, 45);

            // Titre Facture
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(30, 41, 59);
            pdf.text("FEUILLE DE SOINS", pageWidth / 2, 60, { align: "center" });
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(100, 116, 139);
            pdf.text(`Facture N° ${invoice.id.slice(-8).toUpperCase()}`, pageWidth / 2, 66, { align: "center" });

            // Infos Patient vs Date
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.text("BÉNÉFICIAIRE DES SOINS", 20, 80);
            pdf.text("DATE DE L'ACTE", pageWidth - 20, 80, { align: "right" });

            pdf.setFontSize(11);
            pdf.setTextColor(30, 41, 59);
            pdf.text(`${patient.nom.toUpperCase()} ${patient.prenom}`, 20, 87);
            pdf.text(format(new Date(consultation.dateHeure), "dd MMMM yyyy", { locale: fr }), pageWidth - 20, 87, { align: "right" });

            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Identifiant: ${patient.codePatient}`, 20, 92);

            // Table Header
            pdf.setFillColor(248, 250, 252); // slate-50
            pdf.rect(20, 105, pageWidth - 40, 10, "F");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.text("CODE ACTE", 25, 111);
            pdf.text("DÉSIGNATION", 55, 111);
            pdf.text("MONTANT", pageWidth - 25, 111, { align: "right" });

            // Table Body
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.setTextColor(30, 41, 59);
            pdf.text("JQMD001", 25, 125);
            pdf.text(`${consultation.type} - Acte principal`, 55, 125);
            pdf.setFont("helvetica", "bold");
            pdf.text(formatCurrency(invoice.montant), pageWidth - 25, 125, { align: "right" });

            // Total
            pdf.setDrawColor(226, 232, 240);
            pdf.line(20, 135, pageWidth - 20, 135);
            pdf.setFontSize(12);
            pdf.text("TOTAL À RÉGLER", 130, 145);
            pdf.setFontSize(14);
            pdf.setTextColor(79, 70, 229);
            pdf.text(formatCurrency(invoice.montant), pageWidth - 25, 145, { align: "right" });

            // Mode de paiement
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(20, 160, pageWidth - 40, 20, 3, 3, "F");
            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.text("MODE DE RÈGLEMENT", 30, 168);
            pdf.text("STATUT", pageWidth - 30, 168, { align: "right" });

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(30, 41, 59);
            pdf.text(invoice.mode, 30, 174);
            pdf.setTextColor(16, 185, 129); // emerald-500
            pdf.text(`AQUITTÉE LE ${format(new Date(invoice.dateReglement), "dd/MM/yyyy")}`, pageWidth - 30, 174, { align: "right" });

            // Footer
            pdf.setFontSize(7);
            pdf.setTextColor(148, 163, 184); // slate-400
            const footerText = "Cette feuille de soin est générée électroniquement par le système Gynaeasy. Conforme aux normes de facturation médicale en vigueur.";
            pdf.text(footerText, 20, 280, { maxWidth: 80 });

            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(100, 116, 139);
            pdf.text("SIGNATURE ET CACHET", pageWidth - 20, 245, { align: "right" });
            pdf.setDrawColor(226, 232, 240);
            pdf.line(pageWidth - 70, 250, pageWidth - 20, 250);
            pdf.setTextColor(30, 41, 59);
            pdf.text(doctor.name.toUpperCase(), pageWidth - 45, 260, { align: "center" });

            // Nom de fichier propre: Facture_NOM_PRENOM_DATE.pdf
            const cleanNom = patient.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_");
            const cleanPrenom = patient.prenom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_");
            const dateStr = format(new Date(), "ddMMyyyy");
            const fileName = `Facture_${cleanNom}_${cleanPrenom}_${dateStr}.pdf`;

            console.log("Génération PDF:", fileName);
            pdf.save(fileName);
            toast.success("Facture téléchargée !", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la génération du PDF", { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Facturation & Encaissements</h1>
                    <p className="text-slate-500 text-sm">Gérez les actes CCAM et les règlements du cabinet</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Download className="h-4 w-4" />
                        Exporter Rapport
                    </button>
                    {/* Feature not yet fully implemented
                    <button className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
                        <Plus className="h-4 w-4" />
                        Acte Hors Consultation
                    </button>
                    */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                {/* Statistiques rapides */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Encaissé (Jour)</p>
                        <h3 className="text-2xl font-black text-slate-900">{formatCurrency(invoices.reduce((acc, curr) => acc + curr.montant, 0))}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">En attente</p>
                        <h3 className="text-2xl font-black text-slate-900">{pendingConsultations.length} Actes</h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                </div>
                <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-between text-white">
                    <div>
                        <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Taux de Recouvrement</p>
                        <h3 className="text-2xl font-black">94%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <ArrowUpRight className="h-6 w-6 text-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
                {/* Liste des actes en attente */}
                <div className="lg:col-span-8 flex flex-col space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Actes à facturer
                            </h2>
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ACTION REQUISE</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patiente</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Médecin / Acte</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Montant estimé</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {pendingConsultations.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-slate-900">{c.patient.prenom} {c.patient.nom}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">#{c.patient.codePatient}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-700 font-medium">{c.user.name}</p>
                                                <p className="text-xs text-indigo-600 font-bold">{c.type}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                                {format(new Date(c.dateHeure), "HH:mm", { locale: fr })}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-900 text-right">
                                                {formatCurrency(c.honoraire || 25000)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleOpenPayment(c)}
                                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-indigo-100"
                                                >
                                                    Encaisser
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Historique des factures */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 flex items-center gap-2">
                                <Receipt className="h-5 w-5 text-indigo-500" />
                                Dernières factures
                            </h2>
                        </div>
                        <div className="p-4 space-y-3 overflow-y-auto max-h-[500px]">
                            {invoices.map((inv) => (
                                <div key={inv.id} className="p-4 rounded-xl border border-slate-50 bg-slate-50/30 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{inv.consultation.patient.prenom} {inv.consultation.patient.nom}</p>
                                            <p className="text-[10px] text-slate-500 font-medium">{format(new Date(inv.dateReglement), "dd/MM/yyyy • HH:mm")}</p>
                                        </div>
                                        <span className="text-sm font-black text-emerald-600">{formatCurrency(inv.montant)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            {inv.mode === "ESPECES" && <Banknote className="h-3 w-3 text-slate-400" />}
                                            {inv.mode === "CB" && <CreditCard className="h-3 w-3 text-slate-400" />}
                                            {inv.mode === "CHEQUE" && <FileText className="h-3 w-3 text-slate-400" />}
                                            {inv.mode === "SANTE" && <Activity className="h-3 w-3 text-slate-400" />}
                                            {(inv.mode === "WAVE" || inv.mode === "ORANGE_MONEY") && <Smartphone className="h-3 w-3 text-slate-400" />}
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{inv.mode === "ORANGE_MONEY" ? "ORANGE M." : inv.mode === "SANTE" ? "MUTUELLE" : inv.mode}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePrintFeuille(inv)}
                                                className="text-indigo-600 hover:text-indigo-800 p-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded transition-all"
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                                FDS
                                            </button>
                                            <button
                                                onClick={() => handleDownloadInvoice(inv)}
                                                className="text-slate-600 hover:text-slate-800 p-1"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Paiement */}
            {isPayModalOpen && selectedConsultation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsPayModalOpen(false)} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-xl font-black text-slate-800">Finaliser l'encaissement</h2>
                            <p className="text-slate-500 text-sm">Patiente: {selectedConsultation.patient.prenom} {selectedConsultation.patient.nom}</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex flex-col items-center justify-center py-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total à payer</p>
                                <h4 className="text-4xl font-black text-indigo-700">{formatCurrency(selectedConsultation.honoraire || 25000)}</h4>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mode de règlement</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {["ESPECES", "CB", "WAVE", "ORANGE_MONEY", "SANTE", "CHEQUE"].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => setPaymentMode(mode)}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${paymentMode === mode ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}
                                        >
                                            {mode === "ESPECES" && <Banknote className="h-5 w-5 mb-1" />}
                                            {mode === "CB" && <CreditCard className="h-5 w-5 mb-1" />}
                                            {mode === "CHEQUE" && <FileText className="h-5 w-5 mb-1" />}
                                            {mode === "SANTE" && <Activity className="h-5 w-5 mb-1" />}
                                            {mode === "WAVE" && <Smartphone className={`h-5 w-5 mb-1 ${paymentMode === mode ? 'text-white' : 'text-blue-400'}`} />}
                                            {mode === "ORANGE_MONEY" && <Smartphone className={`h-5 w-5 mb-1 ${paymentMode === mode ? 'text-white' : 'text-orange-500'}`} />}
                                            <span className="text-[10px] font-black uppercase tracking-tight text-center">
                                                {mode === "ORANGE_MONEY" ? "ORANGE M." : mode === "SANTE" ? "MUTUELLE" : mode}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setIsPayModalOpen(false)}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                Confirmer l'encaissement
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Succès après Paiement */}
            {justPaidInvoice && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 no-print">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden text-center p-8">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Paiement Réussi !</h2>
                        <p className="text-slate-500 text-sm mb-8">L'encaissement de {formatCurrency(justPaidInvoice.montant)} a été enregistré.</p>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => handlePrintFeuille(justPaidInvoice)}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-200"
                            >
                                <Printer className="h-5 w-5" />
                                Imprimer le reçu (FDS)
                            </button>
                            <button
                                onClick={() => handleDownloadInvoice(justPaidInvoice)}
                                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition-all"
                            >
                                <Download className="h-5 w-5" />
                                Télécharger le PDF
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest"
                            >
                                Fermer et continuer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template d'impression masqué */}
            {printingInvoice && (
                <FeuilleSoinPrint invoice={printingInvoice} clinicInfo={clinicSettings} />
            )}

            <style jsx global>{`
                @media print {
                    /* Cacher tout par défaut */
                    body * {
                        visibility: hidden;
                    }
                    /* Afficher uniquement la facture et ses enfants */
                    #feuille-soin-print, #feuille-soin-print * {
                        visibility: visible;
                    }
                    /* Positionner la facture en haut à gauche de la page */
                    #feuille-soin-print {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    /* Supprimer les marges forcées par certains navigateurs */
                    @page {
                        margin: 0;
                    }
                }
            `}</style>
        </div>
    );
}
