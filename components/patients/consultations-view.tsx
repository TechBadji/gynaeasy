"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ConsultationForm } from "@/components/patients/consultation-form";
import { createEmptyConsultation } from "@/app/actions/consultation";
import toast from "react-hot-toast";
import { PlusCircle, Stethoscope, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConsultationsViewProps {
    consultations: any[];
    patientId: string;
}

export function ConsultationsView({ consultations, patientId }: ConsultationsViewProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [localConsultations, setLocalConsultations] = useState(consultations);
    const router = useRouter();

    const handleNewConsultation = async () => {
        setIsCreating(true);
        try {
            const result = await createEmptyConsultation(patientId);
            if (result.success && result.consultationId) {
                // Ajouter la nouvelle consultation en tête de liste (optimistic UI)
                const newConsult = {
                    id: result.consultationId,
                    type: "CONSULTATION",
                    dateHeure: new Date().toISOString(),
                    motif: "Consultation du jour",
                    honoraire: 0,
                    reglement: null,
                    notes: null,
                    donneesMedicales: null,
                };
                setLocalConsultations((prev) => [newConsult, ...prev]);
                setEditingId(result.consultationId);
                toast.success("Nouvelle consultation créée — remplissez le dossier ci-dessous");
            } else {
                toast.error(result.message || "Erreur lors de la création de la consultation");
            }
        } catch (error) {
            toast.error("Erreur inattendue");
        } finally {
            setIsCreating(false);
        }
    };

    const handleSaveSuccess = () => {
        router.refresh();
        // Garder le formulaire ouvert après sauvegarde pour continuer à saisir
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-pink-600" />
                        Historique des Consultations
                    </CardTitle>
                    <Button
                        onClick={handleNewConsultation}
                        disabled={isCreating}
                        className="bg-pink-600 hover:bg-pink-700 text-white gap-2"
                        size="sm"
                    >
                        <PlusCircle className="h-4 w-4" />
                        {isCreating ? "Création..." : "Nouvelle consultation"}
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {localConsultations.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {localConsultations.map((c) => (
                                <div key={c.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                    {/* En-tête de la consultation */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 border-b-2 border-pink-200 inline-block pb-1 mb-2">
                                                {c.type.replace(/_/g, ' ')}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full inline-block ml-3">
                                                {new Date(c.dateHeure).toLocaleDateString("fr-FR", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })} à {new Date(c.dateHeure).toLocaleTimeString("fr-FR", {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            <div>
                                                <div className="text-lg font-bold text-slate-900">
                                                    {formatCurrency(c.honoraire || 0)}
                                                </div>
                                                <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded mt-1 inline-block text-center w-full">
                                                    {c.reglement?.statut || "EN_ATTENTE"}
                                                </div>
                                            </div>
                                            <Button
                                                variant={editingId === c.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setEditingId(editingId === c.id ? null : c.id)}
                                                className={editingId === c.id ? "bg-pink-600 hover:bg-pink-700" : ""}
                                            >
                                                {editingId === c.id ? (
                                                    <>
                                                        <ChevronUp className="h-4 w-4 mr-1" />
                                                        Fermer le dossier
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="h-4 w-4 mr-1" />
                                                        Saisir / Ouvrir le dossier
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Formulaire de saisie ou récapitulatif */}
                                    {editingId === c.id ? (
                                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <ConsultationForm
                                                consultationId={c.id}
                                                initialData={c.donneesMedicales}
                                                onSaveSuccess={handleSaveSuccess}
                                            />
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            {c.motif && (
                                                <div className="mb-3">
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Motif :</h4>
                                                    <p className="text-sm text-slate-600 bg-white p-3 rounded border border-slate-100">{c.motif}</p>
                                                </div>
                                            )}

                                            {c.notes && !c.donneesMedicales && (
                                                <div className="mb-3">
                                                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Notes (archive) :</h4>
                                                    <pre className="text-sm text-slate-600 bg-white p-3 rounded border border-slate-100 whitespace-pre-wrap font-sans">
                                                        {c.notes}
                                                    </pre>
                                                </div>
                                            )}

                                            {/* Récap des données médicales structurées */}
                                            {c.donneesMedicales && (
                                                <div className="grid grid-cols-2 gap-3 mt-3">
                                                    {c.donneesMedicales.constantes && (c.donneesMedicales.constantes.poids || c.donneesMedicales.constantes.ta) && (
                                                        <div className="bg-blue-50/50 p-3 rounded border border-blue-100 col-span-2 md:col-span-1">
                                                            <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Constantes</h4>
                                                            <div className="text-sm text-slate-700 grid grid-cols-2 gap-1">
                                                                {c.donneesMedicales.constantes.poids && <span>Poids: <b className="text-blue-900">{c.donneesMedicales.constantes.poids} kg</b></span>}
                                                                {c.donneesMedicales.constantes.ta && <span>TA: <b className="text-blue-900">{c.donneesMedicales.constantes.ta}</b></span>}
                                                                {c.donneesMedicales.constantes.pouls && <span>Pouls: <b className="text-blue-900">{c.donneesMedicales.constantes.pouls} bpm</b></span>}
                                                                {c.donneesMedicales.constantes.temp && <span>Temp: <b className="text-blue-900">{c.donneesMedicales.constantes.temp}°C</b></span>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {c.donneesMedicales.examen && (c.donneesMedicales.examen.speculum || c.donneesMedicales.examen.tv || c.donneesMedicales.examen.seins) && (
                                                        <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100 col-span-2 md:col-span-1">
                                                            <h4 className="text-xs font-bold text-emerald-800 uppercase mb-2">Examen Clinique</h4>
                                                            <div className="text-sm text-slate-700 space-y-1">
                                                                {c.donneesMedicales.examen.speculum && <div><span className="font-semibold text-emerald-900">Spéculum :</span> <span className="whitespace-pre-wrap">{c.donneesMedicales.examen.speculum}</span></div>}
                                                                {c.donneesMedicales.examen.tv && <div><span className="font-semibold text-emerald-900">TV :</span> <span className="whitespace-pre-wrap">{c.donneesMedicales.examen.tv}</span></div>}
                                                                {c.donneesMedicales.examen.seins && <div><span className="font-semibold text-emerald-900">Seins :</span> <span>{c.donneesMedicales.examen.seins}</span></div>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {c.donneesMedicales.echo && (c.donneesMedicales.echo.lcc || c.donneesMedicales.echo.conclusion) && (
                                                        <div className="bg-purple-50/50 p-3 rounded border border-purple-100 col-span-2">
                                                            <h4 className="text-xs font-bold text-purple-800 uppercase mb-2">Échographie</h4>
                                                            <div className="text-sm text-slate-700 space-y-2">
                                                                <div className="flex gap-4 flex-wrap">
                                                                    {c.donneesMedicales.echo.lcc && <span>LCC: <b>{c.donneesMedicales.echo.lcc}</b> mm</span>}
                                                                    {c.donneesMedicales.echo.bip && <span>BIP: <b>{c.donneesMedicales.echo.bip}</b> mm</span>}
                                                                    {c.donneesMedicales.echo.pc && <span>PC: <b>{c.donneesMedicales.echo.pc}</b> mm</span>}
                                                                    {c.donneesMedicales.echo.pa && <span>PA: <b>{c.donneesMedicales.echo.pa}</b> mm</span>}
                                                                    {c.donneesMedicales.echo.lf && <span>LF: <b>{c.donneesMedicales.echo.lf}</b> mm</span>}
                                                                </div>
                                                                {c.donneesMedicales.echo.conclusion && <div><span className="font-semibold text-purple-900">Conclusion :</span> <p className="whitespace-pre-wrap mt-1">{c.donneesMedicales.echo.conclusion}</p></div>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {c.donneesMedicales.prescription && (
                                                        <div className="bg-orange-50/50 p-3 rounded border border-orange-100 col-span-2 md:col-span-1">
                                                            <h4 className="text-xs font-bold text-orange-800 uppercase mb-2">Prescription</h4>
                                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.donneesMedicales.prescription}</p>
                                                        </div>
                                                    )}

                                                    {c.donneesMedicales.conclusion && (
                                                        <div className="bg-pink-50/50 p-3 rounded border border-pink-100 col-span-2 md:col-span-1">
                                                            <h4 className="text-xs font-bold text-pink-800 uppercase mb-2">Conclusion / CAT</h4>
                                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.donneesMedicales.conclusion}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Message si aucune donnée encore saisie */}
                                            {!c.motif && !c.notes && !c.donneesMedicales && (
                                                <div className="text-center py-4 text-slate-400 text-sm italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                    Aucune donnée saisie — cliquez sur &quot;Saisir / Ouvrir le dossier&quot; pour renseigner cette consultation.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-500">
                            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <p className="font-medium mb-2">Aucune consultation enregistrée pour ce patient.</p>
                            <p className="text-sm text-slate-400 mb-6">Cliquez sur &quot;Nouvelle consultation&quot; pour démarrer.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
