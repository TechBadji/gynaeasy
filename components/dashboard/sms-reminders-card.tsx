"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Bell, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getRemindersCount, sendDailyReminders } from "@/app/actions/reminders";
import toast from "react-hot-toast";

export default function SmsRemindersCard() {
    const [count, setCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Par défaut on envoie les rappels pour DEMAIN
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    useEffect(() => {
        const fetchCount = async () => {
            setLoading(true);
            try {
                const res = await getRemindersCount(tomorrow);
                setCount(res);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchCount();
    }, []);

    const handleSend = async () => {
        setSending(true);
        const toastId = toast.loading("Envoi des rappels en cours...");
        
        try {
            const res = await sendDailyReminders(tomorrow);
            if (res.success) {
                toast.success(res.message, { id: toastId });
                setCount(0); // On remet à zéro après envoi
            } else {
                toast.error(res.message || "Erreur lors de l'envoi", { id: toastId });
            }
        } catch (error) {
            toast.error("Une erreur imprévue est survenue", { id: toastId });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 rounded-2xl">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                {count !== null && count > 0 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100 animate-pulse">
                        <AlertCircle className="h-3 w-3" />
                        {count} EN ATTENTE
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Rappels SMS (Demain)</h3>
                <p className="text-sm text-slate-500 mb-6 italic">
                    Envoyez les SMS de confirmation aux patients ayant RDV demain.
                </p>
            </div>

            <button
                onClick={handleSend}
                disabled={sending || count === 0 || loading}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${
                    count === 0 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                }`}
            >
                {sending ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Envoi...</>
                ) : count === 0 ? (
                    <><CheckCircle2 className="h-5 w-5" /> Tout est à jour</>
                ) : (
                    <><Bell className="h-5 w-5" /> Envoyer {count} rappels</>
                )
                }
            </button>
        </div>
    );
}
