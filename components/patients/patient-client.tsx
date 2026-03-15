"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PregnancyTimeline from "@/components/patients/pregnancy-timeline";
import { Calendar, Stethoscope, FileText, Settings, Activity } from "lucide-react";
import { DeclarePregnancyModal } from "@/components/patients/declare-pregnancy-modal";
import { ConsultationsView } from "@/components/patients/consultations-view";

export function PatientClient({ patient }: { patient: any }) {
    const [activeTab, setActiveTab] = useState<"dossier" | "consultations" | "documents">("dossier");
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

    useEffect(() => {
        const generateQR = async () => {
            try {
                // Lien vers le dossier public (à adapter selon votre domaine)
                const publicUrl = `${window.location.origin}/p/${patient.codePatient}`;
                const data = JSON.stringify({
                    code: patient.codePatient,
                    nom: patient.nom,
                    prenom: patient.prenom,
                    url: patient.isPublic ? publicUrl : null
                });
                const url = await QRCode.toDataURL(data, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#0f172a',
                        light: '#f8fafc',
                    }
                });
                setQrCodeUrl(url);
            } catch (err) {
                console.error(err);
            }
        };
        generateQR();
    }, [patient]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        {patient.civilite} {patient.nom.toUpperCase()} {patient.prenom}
                        <span className="text-sm font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                            #{patient.codePatient}
                        </span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${patient.isPublic ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <p className="text-slate-500 text-sm">
                            Né(e) le : {new Date(patient.dateNaissance).toLocaleDateString("fr-FR")} • {patient.telephone || 'Pas de tel'} •
                            <span className={`ml-1 font-semibold ${patient.isPublic ? 'text-blue-600' : 'text-amber-600'}`}>
                                Dossier {patient.isPublic ? 'Public' : 'Privé'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* TABS HEADER */}
            <div className="flex space-x-1 border-b pb-px">
                <button
                    onClick={() => setActiveTab("dossier")}
                    className={`px-4 py-2 font-medium text-sm inline-flex items-center transition-colors ${activeTab === 'dossier' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Activity className="h-4 w-4 mr-2" />
                    Dossier Médical
                </button>
                <button
                    onClick={() => setActiveTab("consultations")}
                    className={`px-4 py-2 font-medium text-sm inline-flex items-center transition-colors ${activeTab === 'consultations' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Consultations
                </button>
                <button
                    onClick={() => setActiveTab("documents")}
                    className={`px-4 py-2 font-medium text-sm inline-flex items-center transition-colors ${activeTab === 'documents' ? 'border-b-2 border-pink-600 text-pink-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === "dossier" && (
                <div className="grid gap-6 md:grid-cols-3">
                    {/* COLONNE INFOS */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-violet-200">
                            <CardHeader className="pb-3 bg-violet-50">
                                <CardTitle className="text-base flex items-center justify-between">
                                    Carte d'Identité Patient
                                    <span className="text-[10px] bg-violet-200 text-violet-700 px-2 py-0.5 rounded-full font-bold">QR ACTIVE</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex flex-col items-center">
                                    <div className="p-2 bg-slate-50 border-2 border-slate-100 rounded-xl mb-4 shadow-inner">
                                        {qrCodeUrl ? (
                                            <img src={qrCodeUrl} alt="Patient QR Code" className="w-40 h-40" />
                                        ) : (
                                            <div className="w-40 h-40 flex items-center justify-center text-slate-400 italic text-xs">Génération...</div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center px-4">
                                        Scannez pour accéder aux informations de base et aux autorisations de partage.
                                    </p>
                                </div>
                                <div className="text-sm space-y-2 text-slate-600 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-900">Code Unique:</span>
                                        <span className="font-mono font-bold text-violet-600">#{patient.codePatient}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-900">Groupe Sanguin:</span>
                                        <span>{patient.groupeSanguin || "?"}{patient.rhesus || ""}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-900">Email:</span>
                                        <span className="text-right truncate max-w-[150px]" title={patient.email || "-"}>{patient.email || "-"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base text-red-600">Antécédents & Traitements</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-slate-600">
                                <div className="mb-4">
                                    <div className="font-semibold text-slate-900 mb-1">Traitements en cours</div>
                                    <div>{patient.traitementsEnCours || "Aucun"}</div>
                                </div>
                                {patient.antecedentsMedicaux ? (
                                    <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-sm">
                                        {typeof patient.antecedentsMedicaux === 'object' && patient.antecedentsMedicaux !== null && 'texte' in patient.antecedentsMedicaux
                                            ? patient.antecedentsMedicaux.texte
                                            : typeof patient.antecedentsMedicaux === 'string'
                                                ? patient.antecedentsMedicaux
                                                : JSON.stringify(patient.antecedentsMedicaux)}
                                    </div>
                                ) : (
                                    <div className="italic">Aucun antécédent particulier renseigné.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLONNE SUIVI GROSSESSE */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-lg">Suivi de Grossesse</CardTitle>
                                <DeclarePregnancyModal patientId={patient.id} />
                            </CardHeader>
                            <CardContent>
                                {patient.grossesses.length > 0 ? (
                                    <>
                                        {patient.grossesses.map((g: any) => (
                                            <div key={g.id} className="mb-6 last:mb-0">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className={`h-2 w-2 rounded-full ${g.statut === "EN_COURS" ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
                                                    <span className="font-semibold text-slate-900">
                                                        {g.statut === "EN_COURS" ? "Grossesse Actuelle" : "Grossesse Précédente"}
                                                    </span>
                                                </div>
                                                {g.statut === "EN_COURS" ? (
                                                    <PregnancyTimeline ddr={g.ddr ? new Date(g.ddr) : null} />
                                                ) : (
                                                    <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">Terminée - DPA: {g.dpa ? new Date(g.dpa).toLocaleDateString('fr-FR') : "N/A"}</div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        Aucune grossesse enregistrée pour cette patiente.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Aperçu des dernières consultations (pour ne pas vider complètement la vue principale) */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-lg">Dernières Consultations</CardTitle>
                                <button onClick={() => setActiveTab("consultations")} className="text-sm font-medium text-pink-600 hover:text-pink-700">
                                    Voir tout
                                </button>
                            </CardHeader>
                            <CardContent>
                                {patient.consultations.slice(0, 3).length > 0 ? (
                                    <div className="space-y-4">
                                        {patient.consultations.slice(0, 3).map((c: any) => (
                                            <div key={c.id} className="flex justify-between items-center p-3 border rounded-lg bg-white">
                                                <div>
                                                    <div className="font-medium text-slate-900">{c.type.replace('_', ' ')}</div>
                                                    <div className="text-xs text-slate-500">{new Date(c.dateHeure).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                                <button onClick={() => setActiveTab("consultations")} className="text-sm text-pink-600 font-medium hover:underline">
                                                    Ouvrir
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                        Aucune consultation enregistrée.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === "consultations" && (
                <ConsultationsView consultations={patient.consultations} patientId={patient.id} />
            )}

            {activeTab === "documents" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-12 text-slate-500">
                        Module de documents en cours de développement.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
