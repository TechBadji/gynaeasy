"use client";

import { useState, useTransition } from "react";
import { approveRegistration } from "@/app/actions/onboarding";
import {
    CheckCircle2,
    XCircle,
    User,
    Mail,
    Building2,
    Stethoscope,
    Calendar,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";

interface SuperAdminApprovalsProps {
    pendingUsers: any[];
}

export default function SuperAdminApprovals({ pendingUsers: initialUsers }: SuperAdminApprovalsProps) {
    const [users, setUsers] = useState(initialUsers);
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleApprove = async (userId: string) => {
        setProcessingId(userId);
        startTransition(async () => {
            try {
                await approveRegistration(userId);
                setUsers(users.filter(u => u.id !== userId));
                toast.success("Médecin approuvé et identifiants envoyés !");
            } catch (err: any) {
                toast.error(err.message || "L'approbation a échoué.");
            } finally {
                setProcessingId(null);
            }
        });
    };

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-3xl text-center">
                <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold">Aucune demande en attente</h3>
                <p className="text-slate-400 max-w-xs mt-2">Toutes les inscriptions ont été traitées. Bon travail !</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="bg-[#0d1526] border border-white/10 rounded-3xl p-6 transition-all hover:border-violet-500/30 group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-xl font-black shadow-lg">
                                    {user.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{user.name}</h3>
                                    <p className="text-slate-400 text-sm flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                En attente
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                                    <Building2 className="h-4 w-4" />
                                    <span className="truncate">{user.clinicName || "Non spécifié"}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5 text-slate-400 text-sm">
                                    <Stethoscope className="h-4 w-4" />
                                    <span className="truncate">{user.specialite}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-slate-400 text-sm text-emerald-400 font-bold">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Email Vérifié
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleApprove(user.id)}
                                disabled={processingId === user.id}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 text-white py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                {processingId === user.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                Approuver & Envoyer Identifiants
                            </button>
                            <button
                                className="px-5 aspect-square bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-2xl transition-all flex items-center justify-center group/reject"
                                title="Rejeter"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
