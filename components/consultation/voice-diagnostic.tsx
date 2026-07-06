"use client";

import { useState, useRef, useEffect } from "react";
import {
    Mic, MicOff, Sparkles, Loader2, ClipboardPaste,
    ChevronDown, ChevronUp, AlertTriangle, RotateCcw, X
} from "lucide-react";
import toast from "react-hot-toast";

interface VoiceDiagnosticProps {
    consultationId: string;
    onInject: (fields: { prescription?: string; conclusion?: string }) => void;
}

type RecordingState = "idle" | "recording" | "processing" | "done" | "error";

function parseSection(text: string, title: string): string {
    const regex = new RegExp(`## ${title}\\n([\\s\\S]*?)(?=\\n## |$)`);
    const match = text.match(regex);
    return match ? match[1].trim() : "";
}

function ResultSection({
    title, content, icon, onInject, injectLabel,
}: {
    title: string; content: string; icon: React.ReactNode;
    onInject?: () => void; injectLabel?: string;
}) {
    if (!content) return null;
    return (
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80">
                <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    {icon}
                    {title}
                </div>
                {onInject && (
                    <button
                        onClick={onInject}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <ClipboardPaste className="h-3 w-3" />
                        {injectLabel ?? "Injecter"}
                    </button>
                )}
            </div>
            <div className="px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                {content}
            </div>
        </div>
    );
}

export default function VoiceDiagnostic({ consultationId, onInject }: VoiceDiagnosticProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [recordingState, setRecordingState] = useState<RecordingState>("idle");
    const [transcription, setTranscription] = useState("");
    const [result, setResult] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const recognitionRef = useRef<any>(null);
    const transcriptionRef = useRef("");

    // Nettoyage à la fermeture
    useEffect(() => {
        return () => { recognitionRef.current?.stop(); };
    }, []);

    const startRecording = () => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "fr-FR";
        recognition.continuous = true;
        recognition.interimResults = true;

        let finalTranscript = transcription;

        recognition.onresult = (event: any) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += (finalTranscript ? " " : "") + t;
                } else {
                    interim = t;
                }
            }
            transcriptionRef.current = finalTranscript;
            setTranscription(finalTranscript + (interim ? " " + interim : ""));
        };

        recognition.onerror = (e: any) => {
            if (e.error !== "aborted") {
                toast.error(`Erreur microphone : ${e.error}`);
                setRecordingState("idle");
            }
        };

        recognition.onend = () => {
            setTranscription(transcriptionRef.current);
            if (recordingState === "recording") setRecordingState("idle");
        };

        recognitionRef.current = recognition;
        recognition.start();
        setRecordingState("recording");
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        setRecordingState("idle");
    };

    const analyze = async () => {
        const text = transcription.trim();
        if (!text) {
            toast.error("Aucun texte à analyser. Dictez d'abord les symptômes.");
            return;
        }
        setResult("");
        setIsStreaming(true);
        setRecordingState("processing");

        try {
            const res = await fetch("/api/ai-diagnostic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ consultationId, transcription: text }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Erreur serveur" }));
                throw new Error(err.error || "Erreur serveur");
            }

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setResult(accumulated);
            }

            setRecordingState("done");
        } catch (err: any) {
            toast.error(err.message || "Erreur lors de l'analyse IA");
            setRecordingState("error");
        } finally {
            setIsStreaming(false);
        }
    };

    const reset = () => {
        stopRecording();
        setTranscription("");
        setResult("");
        setRecordingState("idle");
        transcriptionRef.current = "";
    };

    const isDone = recordingState === "done" && result;
    const prescription = isDone ? parseSection(result, "Ordonnance suggérée") : "";
    const conclusion = isDone ? parseSection(result, "Notes pour le dossier") : "";
    const diagnostic = isDone ? parseSection(result, "Hypothèses diagnostiques") : "";
    const examens = isDone ? parseSection(result, "Examens complémentaires suggérés") : "";

    return (
        <div className="border border-violet-100 rounded-3xl overflow-hidden bg-gradient-to-br from-violet-50/50 to-white">
            {/* En-tête toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-violet-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-black text-slate-900">Assistant IA — Aide au diagnostic</p>
                        <p className="text-xs text-slate-500 font-medium">Dictez les symptômes, obtenez un diagnostic et une ordonnance</p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
            </button>

            {isOpen && (
                <div className="px-5 pb-5 space-y-4 border-t border-violet-100/60">
                    {/* Disclaimer */}
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mt-4">
                        <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                            Les suggestions de l'IA sont indicatives et d'aide à la décision uniquement.
                            Le médecin reste seul responsable du diagnostic et de la prescription.
                        </p>
                    </div>

                    {/* Zone de transcription */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Symptômes dictés
                            </label>
                            {transcription && (
                                <button
                                    onClick={reset}
                                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-500 transition-colors font-medium"
                                >
                                    <RotateCcw className="h-3 w-3" /> Réinitialiser
                                </button>
                            )}
                        </div>
                        <textarea
                            value={transcription}
                            onChange={(e) => setTranscription(e.target.value)}
                            rows={4}
                            placeholder="Dictez ou saisissez ici les signes et symptômes de la patiente…"
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none transition-all"
                        />
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-3">
                        {/* Bouton microphone */}
                        {recordingState !== "recording" ? (
                            <button
                                onClick={startRecording}
                                disabled={isStreaming}
                                className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-violet-400 hover:text-violet-600 transition-all disabled:opacity-40"
                            >
                                <Mic className="h-4 w-4" />
                                Dicter
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-100 transition-all"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                                </span>
                                <MicOff className="h-4 w-4" />
                                Arrêter
                            </button>
                        )}

                        {/* Bouton analyser */}
                        <button
                            onClick={analyze}
                            disabled={!transcription.trim() || isStreaming || recordingState === "recording"}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-black rounded-2xl shadow-md shadow-violet-500/20 transition-all active:scale-[0.98]"
                        >
                            {isStreaming ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Analyse en cours…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Analyser avec l'IA
                                </>
                            )}
                        </button>
                    </div>

                    {/* Résultats */}
                    {(result || isStreaming) && (
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {isStreaming ? "Génération en cours…" : "Résultats de l'analyse"}
                                </span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            {isStreaming && !result && (
                                <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 rounded-2xl">
                                    <Loader2 className="h-4 w-4 text-violet-500 animate-spin" />
                                    <span className="text-sm text-violet-600 font-medium">Claude analyse le dossier…</span>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-3">
                                    <ResultSection
                                        title="Hypothèses diagnostiques"
                                        content={diagnostic}
                                        icon={<span className="text-base">🔬</span>}
                                    />
                                    <ResultSection
                                        title="Examens complémentaires suggérés"
                                        content={examens}
                                        icon={<span className="text-base">📋</span>}
                                    />
                                    <ResultSection
                                        title="Ordonnance suggérée"
                                        content={prescription}
                                        icon={<span className="text-base">💊</span>}
                                        onInject={prescription ? () => {
                                            onInject({ prescription });
                                            toast.success("Ordonnance injectée dans le formulaire");
                                        } : undefined}
                                        injectLabel="→ Ordonnance"
                                    />
                                    <ResultSection
                                        title="Notes pour le dossier"
                                        content={conclusion}
                                        icon={<span className="text-base">📝</span>}
                                        onInject={conclusion ? () => {
                                            onInject({ conclusion });
                                            toast.success("Notes injectées dans la conclusion");
                                        } : undefined}
                                        injectLabel="→ Conclusion"
                                    />

                                    {/* Tout injecter */}
                                    {!isStreaming && (prescription || conclusion) && (
                                        <button
                                            onClick={() => {
                                                onInject({ prescription, conclusion });
                                                toast.success("Ordonnance et conclusion injectées");
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-black rounded-2xl transition-all"
                                        >
                                            <ClipboardPaste className="h-4 w-4" />
                                            Tout injecter dans la consultation
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
