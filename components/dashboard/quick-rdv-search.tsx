"use client";

import { useState, useEffect } from "react";
import { Search, CalendarPlus, Loader2, User } from "lucide-react";
import { searchPatients } from "@/app/actions/patient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuickRdvSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true);
                const patients = await searchPatients(query);
                setResults(patients);
                setIsSearching(false);
                setShowResults(true);
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    return (
        <div className="relative w-full max-w-md">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isSearching ? (
                            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4 text-slate-400" />
                        )}
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border-2 border-indigo-50 rounded-xl leading-5 bg-indigo-50/30 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all font-medium"
                        placeholder="Rechercher un patient (Nom ou Code)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length >= 2 && setShowResults(true)}
                    />
                </div>
                <Link 
                    href="/agenda?new=true" 
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-center flex items-center gap-2 whitespace-nowrap"
                >
                    <CalendarPlus className="h-5 w-5" />
                    <span className="hidden sm:inline">Nouveau rendez vous</span>
                </Link>
            </div>

            {showResults && results.length > 0 && (
                <div 
                    className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setShowResults(false)}
                >
                    <div className="p-2 border-b bg-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Patients trouvés</p>
                    </div>
                    {results.map((patient) => (
                        <Link
                            key={patient.id}
                            href={`/agenda?new=true&patientId=${patient.id}&patientName=${encodeURIComponent(`${patient.civilite} ${patient.nom.toUpperCase()} ${patient.prenom}`)}`}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors group border-b border-slate-50 last:border-0"
                            onClick={() => setShowResults(false)}
                        >
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">
                                    {patient.civilite} {patient.nom.toUpperCase()} {patient.prenom}
                                </p>
                                <p className="text-[10px] font-mono font-medium text-indigo-500">#{patient.codePatient}</p>
                            </div>
                            <CalendarPlus className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </Link>
                    ))}
                </div>
            )}
            
            {showResults && results.length === 0 && query.length >= 2 && !isSearching && (
                <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 text-center">
                    <p className="text-sm text-slate-500">Aucun patient ne correspond à "{query}"</p>
                    <Link 
                        href="/patients"
                        className="mt-2 text-xs font-bold text-indigo-600 hover:underline inline-block"
                    >
                        + Créer une nouvelle fiche patient
                    </Link>
                </div>
            )}
        </div>
    );
}
