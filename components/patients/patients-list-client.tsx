"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, X, User } from "lucide-react";
import NewPatientModal from "@/components/patients/new-patient-modal";

type Patient = {
    id: string;
    codePatient: string;
    civilite: string;
    nom: string;
    prenom: string;
    dateNaissance: Date;
    telephone: string | null;
    email: string | null;
    groupeSanguin: string | null;
    rhesus: string | null;
};

export default function PatientsListClient({ patients }: { patients: Patient[] }) {
    const [query, setQuery] = useState("");
    const [codeQuery, setCodeQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const normalize = (s: string) =>
        s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

    const suggestions = query.trim().length >= 2
        ? patients.filter(p => {
            const q = normalize(query);
            return (
                normalize(p.nom).includes(q) ||
                normalize(p.prenom).includes(q) ||
                normalize(`${p.nom} ${p.prenom}`).includes(q) ||
                normalize(`${p.prenom} ${p.nom}`).includes(q) ||
                (p.telephone ?? "").replace(/\s/g, "").includes(query.replace(/\s/g, ""))
            );
        }).slice(0, 6)
        : [];

    const filtered = patients.filter(p => {
        const q = normalize(query);
        const c = codeQuery.trim();
        const matchQuery = q.length === 0 || (
            normalize(p.nom).includes(q) ||
            normalize(p.prenom).includes(q) ||
            normalize(`${p.nom} ${p.prenom}`).includes(q) ||
            normalize(`${p.prenom} ${p.nom}`).includes(q) ||
            (p.telephone ?? "").replace(/\s/g, "").includes(query.replace(/\s/g, ""))
        );
        const matchCode = c.length === 0 || p.codePatient.includes(c);
        return matchQuery && matchCode;
    });

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                !inputRef.current?.contains(e.target as Node) &&
                !dropdownRef.current?.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const highlight = (text: string) => {
        if (!query.trim()) return text;
        const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part)
                ? <mark key={i} className="bg-violet-100 text-violet-800 rounded px-0.5 not-italic font-semibold">{part}</mark>
                : part
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patients</h1>
                <NewPatientModal />
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4 w-full sm:w-auto">

                        {/* Recherche nom / téléphone avec autocomplete */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Nom, prénom, téléphone..."
                                className="w-full pl-9 pr-8 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            />
                            {query && (
                                <button
                                    onClick={() => { setQuery(""); setShowSuggestions(false); }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}

                            {/* Dropdown suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden"
                                >
                                    {suggestions.map(p => (
                                        <Link
                                            key={p.id}
                                            href={`/patients/${p.id}`}
                                            onClick={() => setShowSuggestions(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-violet-50 transition-colors border-b border-slate-50 last:border-0"
                                        >
                                            <div className="h-7 w-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                                                <User className="h-3.5 w-3.5 text-violet-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-slate-900 truncate">
                                                    {p.civilite} {highlight(p.nom.toUpperCase())} {highlight(p.prenom)}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">
                                                    {p.telephone
                                                        ? highlight(p.telephone)
                                                        : <span className="italic">Pas de téléphone</span>
                                                    }
                                                    {" · "}
                                                    <span className="font-mono text-violet-500">#{p.codePatient}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recherche par code */}
                        <div className="relative w-full sm:w-48">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400 font-bold text-[10px] flex items-center justify-center border border-violet-200 rounded">#</span>
                            <input
                                type="text"
                                maxLength={5}
                                value={codeQuery}
                                onChange={e => setCodeQuery(e.target.value.replace(/\D/g, ""))}
                                placeholder="Code (5 chiffres)"
                                className="w-full pl-9 pr-4 py-2 text-sm border border-violet-100 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            />
                        </div>
                    </div>

                    <span className="text-sm text-slate-500">
                        {filtered.length} / {patients.length} patient{patients.length > 1 ? "s" : ""}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">ID Patient</th>
                                <th className="px-6 py-3 font-medium">Nom / Prénom</th>
                                <th className="px-6 py-3 font-medium">Date de naissance</th>
                                <th className="px-6 py-3 font-medium">Contact</th>
                                <th className="px-6 py-3 font-medium">Groupe</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(patient => (
                                <tr key={patient.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono bg-violet-50 text-violet-600 px-2 py-1 rounded text-xs border border-violet-100">
                                            #{patient.codePatient}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <span className="text-slate-500 font-normal text-xs mr-1">{patient.civilite}</span>
                                        {patient.nom.toUpperCase()} {patient.prenom}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(patient.dateNaissance).toLocaleDateString("fr-FR")}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div>{patient.telephone || "-"}</div>
                                        {patient.email && (
                                            <div className="text-xs text-slate-400">{patient.email}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.groupeSanguin ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {patient.groupeSanguin} {patient.rhesus}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/patients/${patient.id}`}
                                            className="text-violet-600 hover:text-violet-800 font-medium text-sm"
                                        >
                                            Ouvrir le dossier
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        {query || codeQuery
                                            ? "Aucun patient ne correspond à votre recherche."
                                            : "Aucun patient trouvé. Créez un nouveau dossier."
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
