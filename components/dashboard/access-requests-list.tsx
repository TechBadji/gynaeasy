"use client";

import { useState } from "react";
import { handleAccessRequest } from "@/app/actions/patient";
import { Check, X, ShieldAlert, Clock, User } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AccessRequest {
    id: string;
    createdAt: string;
    doctor: {
        name: string | null;
    };
    patient: {
        nom: string;
        prenom: string;
        codePatient: string;
    };
}

export default function AccessRequestsList({ initialRequests }: { initialRequests: any[] }) {
    const [requests, setRequests] = useState(initialRequests);
    const [isPending, setIsPending] = useState<string | null>(null);

    const onHandle = async (id: string, approve: boolean) => {
        setIsPending(id);
        try {
            const res = await handleAccessRequest(id, approve);
            if (res.success) {
                toast.success(approve ? "Accès accordé" : "Accès refusé");
                setRequests(requests.filter(r => r.id !== id));
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Une erreur est survenue");
        } finally {
            setIsPending(null);
        }
    };

    if (requests.length === 0) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-sm font-bold uppercase tracking-widest text-pink-600 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Demandes d'accès en attente ({requests.length})
            </h3>

            <div className="grid gap-3">
                {requests.map((req) => (
                    <div key={req.id} className="bg-white border-2 border-pink-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-bold text-slate-900">
                                    Dr. {req.doctor.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                    souhaite consulter le dossier de <span className="font-bold text-slate-700">{req.patient.prenom} {req.patient.nom}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                                    <Clock className="h-3 w-3" />
                                    Demandé il y a {formatDistanceToNow(new Date(req.createdAt), { addSuffix: false, locale: fr })}
                                    <span className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded ml-2">#{req.patient.codePatient}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => onHandle(req.id, false)}
                                disabled={isPending === req.id}
                                className="flex-1 sm:flex-none h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-red-500 transition-all disabled:opacity-50"
                                title="Refuser"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => onHandle(req.id, true)}
                                disabled={isPending === req.id}
                                className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-pink-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all disabled:opacity-50"
                            >
                                <Check className="h-5 w-5" />
                                Valider
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
