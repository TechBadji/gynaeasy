"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
    Receipt,
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
    Smartphone,
    Loader2,
    ExternalLink,
    RefreshCw,
    AlertTriangle,
    X,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { confirmManualPayment, initiateWavePayment, checkWavePaymentStatus, confirmWavePaymentManual } from "@/app/actions/billing";
import FeuilleSoinPrint from "./feuille-soin-print";

interface BillingDashboardProps {
    recentInvoices: any[];
    pendingConsultations: any[];
    clinicSettings?: any;
}

export default function BillingDashboard({ recentInvoices, pendingConsultations, clinicSettings }: BillingDashboardProps) {
    const [invoices, setInvoices]           = useState(recentInvoices);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
    const [paymentMode, setPaymentMode]     = useState<string>("ESPECES");
    const [amount, setAmount]               = useState<number>(0);
    const [reference, setReference]         = useState("");
    const [printingInvoice, setPrintingInvoice] = useState<any>(null);
    const [justPaidInvoice, setJustPaidInvoice] = useState<any>(null);
    const [isPending, startTransition]      = useTransition();

    // Wave state
    const [waveStep, setWaveStep]           = useState<"idle" | "pending" | "polling" | "done" | "error">("idle");
    const [waveUrl, setWaveUrl]             = useState<string | null>(null);
    const [waveSimulated, setWaveSimulated] = useState(false);
    const [waveReglementId, setWaveReglementId] = useState<string | null>(null);

    const handleOpenPayment = (consultation: any) => {
        setSelectedConsultation(consultation);
        setAmount(consultation.honoraire || 25000);
        setReference("");
        setPaymentMode("ESPECES");
        setWaveStep("idle");
        setWaveUrl(null);
        setWaveReglementId(null);
        setIsPayModalOpen(true);
    };

    const closeModal = () => {
        setIsPayModalOpen(false);
        setWaveStep("idle");
        setWaveUrl(null);
        setWaveReglementId(null);
    };

    // ── Paiement manuel (non-Wave) ────────────────────────────────────────
    const handleConfirmManual = () => startTransition(async () => {
        if (!selectedConsultation) return;
        const res = await confirmManualPayment({
            consultationId: selectedConsultation.id,
            montant:        amount,
            mode:           paymentMode as any,
            reference:      reference || undefined,
        });
        if (res.success) {
            setJustPaidInvoice(res.reglement);
            closeModal();
            toast.success("Encaissement enregistré ✓");
        } else {
            toast.error(res.error || "Erreur");
        }
    });

    // ── Wave : initier le checkout ────────────────────────────────────────
    const handleInitiateWave = () => startTransition(async () => {
        if (!selectedConsultation) return;
        setWaveStep("pending");
        const res = await initiateWavePayment({ consultationId: selectedConsultation.id, montant: amount });
        if (res.success) {
            setWaveUrl(res.waveUrl!);
            setWaveSimulated(res.simulated!);
            setWaveReglementId(res.reglementId!);
            setWaveStep("polling");
        } else {
            toast.error(res.error || "Erreur Wave");
            setWaveStep("error");
        }
    });

    // ── Wave : polling statut ────────────────────────────────────────────
    const handleCheckWave = useCallback(async () => {
        if (!waveReglementId) return;
        const res = await checkWavePaymentStatus(waveReglementId);
        if (res.status === "complete") {
            const r = await confirmWavePaymentManual(waveReglementId);
            if (r.success) {
                setWaveStep("done");
                setJustPaidInvoice(r.reglement);
                closeModal();
                toast.success("Paiement Wave confirmé ✓");
            }
        } else if (res.status === "error") {
            toast.error("La transaction Wave a échoué");
            setWaveStep("error");
        }
    }, [waveReglementId]);

    // Polling automatique toutes les 5s quand Wave est en attente
    useEffect(() => {
        if (waveStep !== "polling") return;
        const interval = setInterval(handleCheckWave, 5000);
        return () => clearInterval(interval);
    }, [waveStep, handleCheckWave]);

    // ── Wave : confirmation manuelle (simulation) ─────────────────────────
    const handleSimulateWave = () => startTransition(async () => {
        if (!waveReglementId) return;
        const res = await confirmWavePaymentManual(waveReglementId);
        if (res.success) {
            setWaveStep("done");
            setJustPaidInvoice(res.reglement);
            closeModal();
            toast.success("Paiement Wave simulé confirmé ✓");
        } else {
            toast.error("Erreur confirmation");
        }
    });

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
            if (!consultation) throw new Error("Données de consultation manquantes");
            
            const { patient, user: doctor } = consultation;
            if (!patient) throw new Error("Données patient manquantes");
            if (!doctor) throw new Error("Données médecin manquantes");

            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            
            // Dates sécurisées
            const dateSoin = consultation.dateHeure ? new Date(consultation.dateHeure) : new Date();
            const datePaiement = invoice.dateReglement ? new Date(invoice.dateReglement) : new Date();


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
            pdf.text(format(dateSoin, "dd MMMM yyyy", { locale: fr }), pageWidth - 20, 87, { align: "right" });

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
            pdf.text("TOTAL À RÉGLER", 100, 145);
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
            pdf.text(`AQUITTÉE LE ${format(datePaiement, "dd/MM/yyyy")}`, pageWidth - 30, 174, { align: "right" });

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
                    <button className="flex items-center gap-2 bg-violet-600 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-violet-700 transition-colors shadow-sm">
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
                <div className="bg-violet-600 p-6 rounded-2xl shadow-lg shadow-violet-200 flex items-center justify-between text-white">
                    <div>
                        <p className="text-xs font-bold text-violet-200 uppercase tracking-widest mb-1">Taux de Recouvrement</p>
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
                                                <p className="text-xs text-violet-600 font-bold">{c.type}</p>
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
                                                    className="bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-violet-100"
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
                                <Receipt className="h-5 w-5 text-violet-500" />
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
                                                className="text-violet-600 hover:text-violet-800 p-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter bg-violet-50 px-2 py-0.5 rounded transition-all"
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

            {/* ── Modal de Paiement ─────────────────────────────────────── */}
            {isPayModalOpen && selectedConsultation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">Encaissement</h2>
                                <p className="text-slate-500 text-sm">
                                    {selectedConsultation.patient.prenom} {selectedConsultation.patient.nom}
                                    <span className="text-slate-400 mx-1">·</span>
                                    <span className="text-xs font-bold text-slate-400">#{selectedConsultation.patient.codePatient}</span>
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors mt-0.5">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Montant éditable */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Montant (FCFA)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(Number(e.target.value))}
                                        disabled={waveStep !== "idle"}
                                        className="w-full text-center text-3xl font-black text-violet-700 bg-violet-50 border border-violet-100 rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-60"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400">FCFA</span>
                                </div>
                            </div>

                            {/* Mode de règlement */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Mode de règlement</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: "ESPECES",      label: "Espèces",    icon: <Banknote className="h-4 w-4" /> },
                                        { id: "WAVE",         label: "Wave",       icon: <Smartphone className="h-4 w-4" /> },
                                        { id: "ORANGE_MONEY", label: "Orange M.",  icon: <Smartphone className="h-4 w-4" /> },
                                        { id: "CB",           label: "CB",         icon: <CreditCard className="h-4 w-4" /> },
                                        { id: "CHEQUE",       label: "Chèque",     icon: <FileText className="h-4 w-4" /> },
                                        { id: "SANTE",        label: "Mutuelle",   icon: <Activity className="h-4 w-4" /> },
                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => { setPaymentMode(m.id); setWaveStep("idle"); setWaveUrl(null); setWaveReglementId(null); }}
                                            disabled={waveStep === "polling"}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-bold transition-all disabled:pointer-events-none ${
                                                paymentMode === m.id
                                                    ? m.id === "WAVE"
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                                        : "bg-violet-600 border-violet-600 text-white shadow-md"
                                                    : "bg-white border-slate-100 text-slate-500 hover:border-violet-200 hover:text-violet-600"
                                            }`}
                                        >
                                            {m.icon}
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Référence (non-Wave) */}
                            {paymentMode !== "WAVE" && (paymentMode === "CHEQUE" || paymentMode === "VIREMENT" || paymentMode === "ORANGE_MONEY") && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Référence / N° transaction</label>
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={e => setReference(e.target.value)}
                                        placeholder="Ex: OM-2026-XXXXX"
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300"
                                    />
                                </div>
                            )}

                            {/* ── Zone Wave ─────────────────────────────────────────── */}
                            {paymentMode === "WAVE" && (
                                <div className="space-y-3">
                                    {/* Simulation badge */}
                                    {!process.env.NEXT_PUBLIC_WAVE_CONFIGURED && (
                                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                            Mode simulation — <span className="font-bold">WAVE_API_KEY</span> non configurée
                                        </div>
                                    )}

                                    {waveStep === "idle" && (
                                        <button
                                            onClick={handleInitiateWave}
                                            disabled={isPending || amount <= 0}
                                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200"
                                        >
                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
                                            Générer le lien Wave
                                        </button>
                                    )}

                                    {(waveStep === "polling" || waveStep === "pending") && (
                                        <div className="space-y-3">
                                            {/* Lien Wave */}
                                            {waveUrl && (
                                                <a
                                                    href={waveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 hover:bg-blue-100 transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Lien de paiement Wave</p>
                                                        <p className="text-[10px] text-blue-500 truncate max-w-[260px]">{waveUrl}</p>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                </a>
                                            )}

                                            {/* Statut polling */}
                                            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                                    <span className="text-xs font-bold text-slate-600">En attente du paiement patient…</span>
                                                </div>
                                                <button onClick={handleCheckWave} disabled={isPending} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
                                                    <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                                                </button>
                                            </div>

                                            {/* Bouton simulation */}
                                            {waveSimulated && (
                                                <button
                                                    onClick={handleSimulateWave}
                                                    disabled={isPending}
                                                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-sm transition-all"
                                                >
                                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                                    Simuler paiement reçu
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {waveStep === "error" && (
                                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                            Échec de la transaction Wave
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 border border-slate-100 transition-colors"
                            >
                                Annuler
                            </button>
                            {paymentMode !== "WAVE" && (
                                <button
                                    onClick={handleConfirmManual}
                                    disabled={isPending || amount <= 0}
                                    className="flex-[2] bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm font-black shadow-lg shadow-violet-100 flex items-center justify-center gap-2 transition-all"
                                >
                                    {isPending
                                        ? <Loader2 className="h-5 w-5 animate-spin" />
                                        : <CheckCircle2 className="h-5 w-5" />}
                                    Valider l'encaissement
                                </button>
                            )}
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
                                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-violet-200"
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
