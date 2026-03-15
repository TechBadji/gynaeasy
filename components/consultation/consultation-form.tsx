"use client";

import { useState } from "react";
import SelectorCCAM from "@/components/consultation/ccam-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function NouvelleConsultationForm({ patientId }: { patientId: string }) {
    const [total, setTotal] = useState(0);

    const handleActesChange = (actes: any[]) => {
        const newTotal = actes.reduce((sum, item) => sum + item.montantTotal, 0);
        setTotal(newTotal);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission to API
        alert(`Consultation enregistrée avec un honoraire de ${formatCurrency(total)}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Détails de la consultation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Type de RDV</label>
                            <select className="w-full border rounded-md p-2">
                                <option value="CONSULTATION">Consultation Classique</option>
                                <option value="ECHOGRAPHIE">Échographie</option>
                                <option value="SUIVI_GROSSESSE">Suivi de grossesse</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Motif</label>
                            <input type="text" className="w-full border rounded-md p-2" placeholder="Ex: Douleurs pelviennes" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Notes médicales</label>
                        <textarea className="w-full border rounded-md p-2 h-32" placeholder="Observation clinique..."></textarea>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cotation CCAM & Honoraires</CardTitle>
                </CardHeader>
                <CardContent>
                    <SelectorCCAM onActesChange={handleActesChange} />

                    <div className="mt-6 pt-4 border-t flex items-center justify-between">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Mode de paiement (Optionnel)</label>
                            <select className="border rounded-md p-2 text-sm bg-slate-50 block">
                                <option value="">À régler plus tard</option>
                                <option value="CB">Carte Bancaire</option>
                                <option value="ESPECES">Espèces</option>
                                <option value="CHEQUE">Chèque</option>
                                <option value="SANTE">Tiers payant (Sécu/Mutuelle)</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-md font-bold transition-colors"
                        >
                            Enregistrer (Total: {formatCurrency(total)})
                        </button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
