"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type ActeCCAM = {
    id: string;
    code: string;
    libelle: string;
    tarif: number;
    coeff: number | null;
};

// Dummy dataset pour l'exemple
const baseActesCCAM: ActeCCAM[] = [
    { id: "1", code: "JQMD001", libelle: "Échographie de dépistage du 1er trimestre de grossesse", tarif: 61.47, coeff: null },
    { id: "2", code: "JQMD002", libelle: "Échographie de dépistage du 2ème trimestre de grossesse", tarif: 81.92, coeff: null },
    { id: "3", code: "JQMD003", libelle: "Échographie de dépistage du 3ème trimestre de grossesse", tarif: 73.19, coeff: null },
    { id: "4", code: "JKHD001", libelle: "Ablation ou changement d'implant pharmacologique souscutané", tarif: 41.80, coeff: null },
    { id: "5", code: "JLQE002", libelle: "Frottis cervicovaginal", tarif: 15.36, coeff: null },
    { id: "6", code: "JNMD001", libelle: "Échographie du petit bassin [pelvis] par voie rectale et/ou vaginale [endocavitaire]", tarif: 52.45, coeff: null },
];

export default function SelectorCCAM({
    onActesChange
}: {
    onActesChange: (actes: { acte: ActeCCAM, quantite: number, montantTotal: number }[]) => void
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<ActeCCAM[]>([]);
    const [selectedActes, setSelectedActes] = useState<{ acte: ActeCCAM, quantite: number, montantTotal: number }[]>([]);

    useEffect(() => {
        if (searchTerm.length >= 2) {
            const filtered = baseActesCCAM.filter(a =>
                a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.libelle.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [searchTerm]);

    const addActe = (acte: ActeCCAM) => {
        const existing = selectedActes.find(a => a.acte.id === acte.id);
        let newSelection;
        if (existing) {
            newSelection = selectedActes.map(a =>
                a.acte.id === acte.id
                    ? { ...a, quantite: a.quantite + 1, montantTotal: (a.quantite + 1) * a.acte.tarif }
                    : a
            );
        } else {
            newSelection = [...selectedActes, { acte, quantite: 1, montantTotal: acte.tarif }];
        }
        setSelectedActes(newSelection);
        onActesChange(newSelection);
        setSearchTerm("");
        setResults([]);
    };

    const removeActe = (id: string) => {
        const newSelection = selectedActes.filter(a => a.acte.id !== id);
        setSelectedActes(newSelection);
        onActesChange(newSelection);
    };

    const total = selectedActes.reduce((sum, item) => sum + item.montantTotal, 0);

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">Rechercher un acte CCAM</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Code (ex: JQMD...) ou Libellé..."
                        className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                </div>

                {/* Results Dropdown */}
                {results.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {results.map(acte => (
                            <button
                                key={acte.id}
                                onClick={() => addActe(acte)}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b last:border-0 flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-medium text-sm text-slate-900">{acte.code}</div>
                                    <div className="text-xs text-slate-500 line-clamp-1">{acte.libelle}</div>
                                </div>
                                <div className="font-bold text-slate-700">{formatCurrency(acte.tarif)}</div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Actes list */}
            {selectedActes.length > 0 && (
                <div className="bg-slate-50 border rounded-md p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900">Actes appliqués</h4>
                    {selectedActes.map((item) => (
                        <div key={item.acte.id} className="flex justify-between items-center bg-white p-3 border rounded">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm bg-slate-100 px-2 py-0.5 rounded">{item.acte.code}</span>
                                    <span className="text-sm font-medium">{item.acte.libelle}</span>
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Qté: {item.quantite} × {formatCurrency(item.acte.tarif)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="font-bold text-slate-900">{formatCurrency(item.montantTotal)}</div>
                                <button onClick={() => removeActe(item.acte.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center bg-pink-50 text-pink-900 p-3 rounded-md font-bold text-lg border border-pink-100">
                        <span>Total Honoraire (CCAM)</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
