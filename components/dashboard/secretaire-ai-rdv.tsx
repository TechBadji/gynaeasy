"use client";

import { useState, useRef } from "react";
import { Sparkles, Mic, MicOff, Loader2, CheckCircle2, CalendarPlus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SecretaireAiRdv() {
    const router = useRouter();
    const [aiText, setAiText]           = useState("");
    const [aiLoading, setAiLoading]     = useState(false);
    const [aiRecording, setAiRecording] = useState(false);
    const [result, setResult]           = useState<any>(null);
    const recRef                        = useRef<any>(null);

    const toggleMic = () => {
        if (aiRecording) {
            recRef.current?.stop();
            setAiRecording(false);
            return;
        }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { toast.error("Reconnaissance vocale non supportée. Utilisez Chrome ou Edge."); return; }
        const rec = new SR();
        rec.lang = "fr-FR";
        rec.onresult = (e: any) => {
            const t = Array.from(e.results).map((r: any) => r[0].transcript).join(" ");
            setAiText(t);
        };
        rec.onend = () => setAiRecording(false);
        rec.onerror = () => setAiRecording(false);
        recRef.current = rec;
        rec.start();
        setAiRecording(true);
    };

    const analyse = async () => {
        if (!aiText.trim()) return;
        setAiLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/ai-rdv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: aiText }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || "Erreur IA");
            }
            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            toast.error(err.message || "Impossible d'analyser le texte");
        } finally {
            setAiLoading(false);
        }
    };

    const planifier = () => {
        if (!result) return;
        const params = new URLSearchParams({ new: "true" });
        if (result.date)        params.set("aiDate",    result.date);
        if (result.time)        params.set("aiTime",    result.time);
        if (result.type)        params.set("aiType",    result.type);
        if (result.motif)       params.set("aiMotif",   encodeURIComponent(result.motif));
        if (result.patientName) params.set("aiPatient", encodeURIComponent(result.patientName));
        router.push(`/agenda?${params.toString()}`);
    };

    const TYPE_LABELS: Record<string, string> = {
        CONSULTATION: "Consultation",
        ECHOGRAPHIE: "Échographie",
        SUIVI_GROSSESSE: "Suivi grossesse",
        URGENCE: "Urgence",
        TELECONSULTATION: "Téléconsultation",
    };

    return (
        <div className="space-y-4">
            {/* Input zone */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={aiText}
                        onChange={(e) => { setAiText(e.target.value); setResult(null); }}
                        onKeyDown={(e) => e.key === "Enter" && analyse()}
                        placeholder='Ex : "RDV Mme Diallo demain à 10h pour suivi grossesse"'
                        className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-sm text-white placeholder:text-violet-200 focus:outline-none focus:bg-white/30 focus:border-white/50 pr-12 transition-all"
                    />
                    <button
                        type="button"
                        onClick={toggleMic}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${aiRecording ? "text-red-300 animate-pulse" : "text-violet-200 hover:text-white"}`}
                        title={aiRecording ? "Arrêter la dictée" : "Dicter"}
                    >
                        {aiRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={analyse}
                    disabled={!aiText.trim() || aiLoading}
                    className="flex items-center gap-2 px-5 py-3 bg-white text-violet-700 font-black text-sm rounded-xl hover:bg-violet-50 disabled:opacity-40 transition-all whitespace-nowrap shadow-lg"
                >
                    {aiLoading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Sparkles className="h-4 w-4" />}
                    Analyser
                </button>
            </div>

            {aiRecording && (
                <div className="flex items-center gap-2 text-violet-100 text-xs font-medium">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    Dictée en cours… parlez maintenant
                </div>
            )}

            {/* Résultat IA */}
            {result && (
                <div className="bg-white/15 border border-white/25 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-300 flex-shrink-0" />
                        <span className="text-white text-sm font-black">Informations extraites</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {result.patientName && (
                            <div className="bg-white/10 rounded-lg px-3 py-2">
                                <p className="text-violet-200 font-bold uppercase tracking-widest text-[9px] mb-0.5">Patient</p>
                                <p className="text-white font-bold truncate">{result.patientName}</p>
                            </div>
                        )}
                        {result.date && (
                            <div className="bg-white/10 rounded-lg px-3 py-2">
                                <p className="text-violet-200 font-bold uppercase tracking-widest text-[9px] mb-0.5">Date</p>
                                <p className="text-white font-bold">{result.date}</p>
                            </div>
                        )}
                        {result.time && (
                            <div className="bg-white/10 rounded-lg px-3 py-2">
                                <p className="text-violet-200 font-bold uppercase tracking-widest text-[9px] mb-0.5">Heure</p>
                                <p className="text-white font-bold">{result.time}</p>
                            </div>
                        )}
                        {result.type && (
                            <div className="bg-white/10 rounded-lg px-3 py-2">
                                <p className="text-violet-200 font-bold uppercase tracking-widest text-[9px] mb-0.5">Type</p>
                                <p className="text-white font-bold">{TYPE_LABELS[result.type] ?? result.type}</p>
                            </div>
                        )}
                        {result.motif && (
                            <div className="bg-white/10 rounded-lg px-3 py-2 col-span-2">
                                <p className="text-violet-200 font-bold uppercase tracking-widest text-[9px] mb-0.5">Motif</p>
                                <p className="text-white font-bold">{result.motif}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={planifier}
                        className="w-full flex items-center justify-center gap-2 bg-white text-violet-700 font-black text-sm py-2.5 rounded-xl hover:bg-violet-50 transition-all shadow-lg"
                    >
                        <CalendarPlus className="h-4 w-4" />
                        Planifier ce RDV
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Lien direct agenda */}
            {!result && (
                <p className="text-violet-200 text-xs">
                    Ou{" "}
                    <a href="/agenda?new=true" className="text-white font-bold underline hover:no-underline">
                        ouvrir directement l&apos;agenda
                    </a>
                </p>
            )}
        </div>
    );
}
