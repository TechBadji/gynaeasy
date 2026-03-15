"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateConsultationMedicalData } from "@/app/actions/consultation";
import toast from "react-hot-toast";

interface ConsultationFormProps {
    consultationId: string;
    initialData?: any;
    onSaveSuccess?: () => void;
}

export function ConsultationForm({ consultationId, initialData, onSaveSuccess }: ConsultationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(initialData || {
        constantes: { poids: "", ta: "", pouls: "", temp: "" },
        examen: { speculum: "", tv: "", seins: "", autres: "" },
        echo: { lcc: "", bip: "", pc: "", pa: "", lf: "", conclusion: "" },
        prescription: "",
        conclusion: ""
    });

    const handleChange = (section: string, field: string, value: string) => {
        if (section) {
            setData((prev: any) => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            }));
        } else {
            setData((prev: any) => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const result = await updateConsultationMedicalData(consultationId, data);
            if (result.success) {
                toast.success("Dossier médical enregistré");
                if (onSaveSuccess) onSaveSuccess();
            } else {
                toast.error(result.message || "Erreur lors de l'enregistrement");
            }
        } catch (error) {
            toast.error("Erreur inattendue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200">
            <Tabs defaultValue="vitals" className="w-full">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="vitals">Constantes</TabsTrigger>
                        <TabsTrigger value="examen">Examen Clin</TabsTrigger>
                        <TabsTrigger value="echo">Échographie</TabsTrigger>
                        <TabsTrigger value="prescription">Prescription</TabsTrigger>
                        <TabsTrigger value="conclusion">Conclusion</TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-6">
                    <TabsContent value="vitals" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Poids (kg)</Label>
                                <Input value={data.constantes.poids} onChange={(e) => handleChange("constantes", "poids", e.target.value)} placeholder="ex: 65" />
                            </div>
                            <div className="space-y-2">
                                <Label>Tension (TA)</Label>
                                <Input value={data.constantes.ta} onChange={(e) => handleChange("constantes", "ta", e.target.value)} placeholder="ex: 12/8" />
                            </div>
                            <div className="space-y-2">
                                <Label>Pouls (bpm)</Label>
                                <Input value={data.constantes.pouls} onChange={(e) => handleChange("constantes", "pouls", e.target.value)} placeholder="ex: 75" />
                            </div>
                            <div className="space-y-2">
                                <Label>Température (°C)</Label>
                                <Input value={data.constantes.temp} onChange={(e) => handleChange("constantes", "temp", e.target.value)} placeholder="ex: 37.2" />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="examen" className="space-y-4 mt-0">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label>Spéculum (Col, Leucorrhées...)</Label>
                                <Textarea className="min-h-[80px]" value={data.examen.speculum} onChange={(e) => handleChange("examen", "speculum", e.target.value)} placeholder="Aspect du col, secretions..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Toucher Vaginal (TV)</Label>
                                <Textarea className="min-h-[80px]" value={data.examen.tv} onChange={(e) => handleChange("examen", "tv", e.target.value)} placeholder="Taille/position de l'utérus, annexes..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Palpation Mammaire</Label>
                                <Input value={data.examen.seins} onChange={(e) => handleChange("examen", "seins", e.target.value)} placeholder="RAS, nodules..." />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="echo" className="space-y-4 mt-0">
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div className="space-y-2"><Label>LCC (mm)</Label><Input value={data.echo.lcc} onChange={(e) => handleChange("echo", "lcc", e.target.value)} /></div>
                            <div className="space-y-2"><Label>BIP (mm)</Label><Input value={data.echo.bip} onChange={(e) => handleChange("echo", "bip", e.target.value)} /></div>
                            <div className="space-y-2"><Label>PC (mm)</Label><Input value={data.echo.pc} onChange={(e) => handleChange("echo", "pc", e.target.value)} /></div>
                            <div className="space-y-2"><Label>PA (mm)</Label><Input value={data.echo.pa} onChange={(e) => handleChange("echo", "pa", e.target.value)} /></div>
                            <div className="space-y-2"><Label>LF (mm)</Label><Input value={data.echo.lf} onChange={(e) => handleChange("echo", "lf", e.target.value)} /></div>
                        </div>
                        <div className="space-y-2">
                            <Label>Conclusion Échographique</Label>
                            <Textarea className="min-h-[80px]" value={data.echo.conclusion} onChange={(e) => handleChange("echo", "conclusion", e.target.value)} placeholder="Rythme cardiaque, vitalité, morphologie..." />
                        </div>
                    </TabsContent>

                    <TabsContent value="prescription" className="space-y-4 mt-0">
                        <div className="space-y-2">
                            <Label>Ordonnance / Traitements prescrits</Label>
                            <Textarea className="min-h-[150px]" value={data.prescription} onChange={(e) => handleChange("", "prescription", e.target.value)} placeholder="Saisir la liste des médicaments ici, ou utiliser des modèles types (à venir)..." />
                        </div>
                    </TabsContent>

                    <TabsContent value="conclusion" className="space-y-4 mt-0">
                        <div className="space-y-2">
                            <Label>Diagnostic & CAT (Conduite À Tenir)</Label>
                            <Textarea className="min-h-[150px]" value={data.conclusion} onChange={(e) => handleChange("", "conclusion", e.target.value)} placeholder="Conclusion de la visite, examens complémentaires demandés, prochain rdv..." />
                        </div>
                    </TabsContent>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-lg">
                    <Button variant="outline">Imprimer CR</Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-pink-600 hover:bg-pink-700">
                        {isLoading ? "Enregistrement..." : "Enregistrer le dossier"}
                    </Button>
                </div>
            </Tabs>
        </div>
    );
}
