"use client";

import { useState, useTransition } from "react";
import { updateAbonnement, createAbonnement, approveUpgrade, refuseUpgrade } from "@/app/actions/superadmin";
import {
    CreditCard, PlusCircle, CheckCircle2, XCircle, Clock, Shield,
    ArrowRight, Check, X, ChevronDown, ChevronUp, MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PLAN_ORDER: Record<string, number> = { SOLO: 0, PRO: 1, CLINIQUE: 2 };

const PLAN_BADGE: Record<string, string> = {
    CLINIQUE: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
    PRO:      "text-violet-400 bg-violet-500/10 border border-violet-500/20",
    SOLO:     "text-slate-300 bg-slate-500/10 border border-slate-500/20",
};

const STATUT_CONFIG: Record<string, { icon: any; color: string }> = {
    ACTIF:  { icon: CheckCircle2, color: "text-emerald-400" },
    ANNULE: { icon: XCircle,      color: "text-red-400" },
    EXPIRE: { icon: Clock,        color: "text-amber-400" },
};

function PlanChip({ plan }: { plan: string }) {
    return (
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${PLAN_BADGE[plan] || PLAN_BADGE.SOLO}`}>
            {plan}
        </span>
    );
}

function DemandeCard({ demande, onDone }: { demande: any; onDone: () => void }) {
    const [isPending, start] = useTransition();
    const [noteAdmin, setNoteAdmin] = useState("");
    const [showNote, setShowNote] = useState(false);
    const isUpgrade = PLAN_ORDER[demande.planDemande] > PLAN_ORDER[demande.planActuel];

    const handleApprove = () => start(async () => {
        try {
            await approveUpgrade(demande.id, noteAdmin || undefined);
            toast.success(`Plan ${demande.planDemande} activé pour ${demande.user?.name}`);
            onDone();
        } catch (e: any) { toast.error(e.message || "Erreur"); }
    });

    const handleRefuse = () => {
        if (!noteAdmin.trim()) { toast.error("Ajoutez un motif de refus"); return; }
        start(async () => {
            try {
                await refuseUpgrade(demande.id, noteAdmin);
                toast.success("Demande refusée — médecin notifié");
                onDone();
            } catch (e: any) { toast.error(e.message || "Erreur"); }
        });
    };

    return (
        <div className="bg-white/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="font-bold text-white truncate">{demande.user?.name || "Médecin"}</p>
                    <p className="text-xs text-slate-400 truncate">{demande.user?.email}</p>
                    {demande.user?.clinicName && (
                        <p className="text-[10px] text-slate-500 truncate">{demande.user.clinicName}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <PlanChip plan={demande.planActuel} />
                    <ArrowRight className={`h-3.5 w-3.5 ${isUpgrade ? "text-emerald-400" : "text-amber-400"}`} />
                    <PlanChip plan={demande.planDemande} />
                </div>
            </div>

            {demande.message && (
                <div className="flex items-start gap-2 bg-white/5 rounded-lg p-3">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 italic">"{demande.message}"</p>
                </div>
            )}

            <p className="text-[10px] text-slate-500">
                Reçue le {format(new Date(demande.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
            </p>

            <div>
                <button
                    onClick={() => setShowNote(!showNote)}
                    className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                >
                    {showNote ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {showNote ? "Masquer" : "Ajouter"} une note au médecin
                </button>
                {showNote && (
                    <input
                        type="text"
                        value={noteAdmin}
                        onChange={e => setNoteAdmin(e.target.value)}
                        placeholder="Message (optionnel pour approuver, requis pour refuser)"
                        className="mt-2 w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
                    />
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleApprove}
                    disabled={isPending}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                    <Check className="h-3.5 w-3.5" />
                    Approuver
                </button>
                <button
                    onClick={handleRefuse}
                    disabled={isPending}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 disabled:opacity-50 text-slate-300 hover:text-red-300 text-xs font-bold px-4 py-2 rounded-lg transition-all"
                >
                    <X className="h-3.5 w-3.5" />
                    Refuser
                </button>
            </div>
        </div>
    );
}

export default function SuperAdminAbonnements({
    abonnements, users, promotions, upgradeRequests: initialRequests,
}: {
    abonnements: any[]; users: any[]; promotions: any[];
    upgradeRequests?: any[];
}) {
    const [list, setList] = useState(abonnements);
    const [requests, setRequests] = useState<any[]>(initialRequests || []);
    const [isPending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    const [newAb, setNewAb] = useState({
        userId: "", plan: "PRO", statut: "ACTIF" as "ACTIF" | "ANNULE" | "EXPIRE",
        reductionType: null as string | null, reductionValeur: null as number | null, notesPromo: "",
    });

    const pending = requests.filter(r => r.statut === "EN_ATTENTE");

    const handleStatusChange = (id: string, field: string, value: any) => {
        startTransition(async () => {
            try {
                await updateAbonnement(id, { [field]: value } as any);
                setList(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
                toast.success("Abonnement mis à jour");
            } catch { toast.error("Erreur de mise à jour"); }
        });
    };

    const handleCreate = async () => {
        if (!newAb.userId) { toast.error("Sélectionnez un utilisateur"); return; }
        startTransition(async () => {
            try {
                const user = users.find(u => u.id === newAb.userId);
                const created = await createAbonnement(newAb as any);
                setList(prev => [{ ...created, user }, ...prev]);
                toast.success("Abonnement créé");
                setCreating(false);
                setNewAb({ userId: "", plan: "PRO", statut: "ACTIF", reductionType: null, reductionValeur: null, notesPromo: "" });
            } catch { toast.error("Erreur de création"); }
        });
    };

    const calculatePrice = (ab: any) => {
        const base: Record<string, number> = { SOLO: 25000, PRO: 50000, CLINIQUE: 95000 };
        let p = base[ab.plan] || 0;
        if (ab.reductionType === "POURCENTAGE" && ab.reductionValeur) p *= 1 - ab.reductionValeur / 100;
        else if (ab.reductionType === "MONTANT_FIXE" && ab.reductionValeur) p = Math.max(0, p - ab.reductionValeur);
        return p;
    };

    const totalMRR = list.filter(a => a.statut === "ACTIF").reduce((s, a) => s + calculatePrice(a), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Abonnements & CRM</h1>
                    <p className="text-slate-400 text-sm mt-1">{list.filter(a => a.statut === "ACTIF").length} abonnement(s) actif(s)</p>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                >
                    <PlusCircle className="h-4 w-4" />
                    Nouvel abonnement
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-violet-500/20 to-pink-500/10 border border-violet-500/20 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">MRR Net</p>
                    <p className="text-2xl font-bold text-white">{totalMRR.toLocaleString("fr-FR")} FCFA</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-slate-400 mb-1">Abonnements Actifs</p>
                    <p className="text-2xl font-bold text-white">{list.filter(a => a.statut === "ACTIF").length}</p>
                </div>
                <div className={`border rounded-xl p-4 ${pending.length > 0 ? "bg-amber-500/10 border-amber-500/30" : "bg-white/5 border-white/10"}`}>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-slate-400">Demandes en attente</p>
                        {pending.length > 0 && (
                            <span className="h-5 min-w-[20px] px-1 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center">
                                {pending.length}
                            </span>
                        )}
                    </div>
                    <p className={`text-2xl font-bold ${pending.length > 0 ? "text-amber-300" : "text-white"}`}>{pending.length}</p>
                </div>
            </div>

            {/* ── Demandes d'upgrade en attente ──────────────────────────── */}
            {pending.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                        <h2 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                            Demandes d'upgrade en attente ({pending.length})
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pending.map(req => (
                            <DemandeCard
                                key={req.id}
                                demande={req}
                                onDone={() => {
                                    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, statut: "TRAITE" } : r));
                                    setList(prev => prev.map(a =>
                                        a.userId === req.userId ? { ...a, plan: req.planDemande } : a
                                    ));
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Formulaire création */}
            {creating && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
                    <h3 className="font-semibold text-white text-sm border-b border-white/5 pb-3">Configurer un nouvel abonnement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Utilisateur / Cabinet</label>
                            <select
                                value={newAb.userId}
                                onChange={e => setNewAb(p => ({ ...p, userId: e.target.value }))}
                                className="w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            >
                                <option value="">Sélectionner un client...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name || u.email}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Plan</label>
                            <select
                                value={newAb.plan}
                                onChange={e => setNewAb(p => ({ ...p, plan: e.target.value }))}
                                className="w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            >
                                {["SOLO", "PRO", "CLINIQUE"].map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Type de réduction</label>
                            <select
                                value={newAb.reductionType || ""}
                                onChange={e => setNewAb(p => ({ ...p, reductionType: e.target.value || null }))}
                                className="w-full bg-[#1a2340] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            >
                                <option value="">Aucune</option>
                                <option value="POURCENTAGE">Pourcentage (%)</option>
                                <option value="MONTANT_FIXE">Montant Fixe (FCFA)</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Valeur réduction</label>
                            <input
                                type="number"
                                value={newAb.reductionValeur || 0}
                                onChange={e => setNewAb(p => ({ ...p, reductionValeur: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs text-slate-400 block mb-1.5">Note interne</label>
                            <input
                                type="text"
                                value={newAb.notesPromo}
                                onChange={e => setNewAb(p => ({ ...p, notesPromo: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                placeholder="Ex: Geste commercial inauguration clinique..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={handleCreate} disabled={isPending} className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-all disabled:opacity-50">
                            {isPending ? "En cours..." : "Valider"}
                        </button>
                        <button onClick={() => setCreating(false)} className="text-slate-400 hover:text-white text-sm px-4 py-2 transition-colors font-medium">
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tous les abonnements</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Depuis</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prix Final</th>
                                <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statut</th>
                                <th className="text-right px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {list.length > 0 ? list.map(ab => (
                                <tr key={ab.id} className="hover:bg-white/3 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-white">{ab.user?.name || "Client Inconnu"}</span>
                                            <span className="text-[10px] text-slate-500">{ab.user?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3 w-3 text-violet-400" />
                                            <PlanChip plan={ab.plan} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-slate-300">
                                            {ab.dateDebut ? format(new Date(ab.dateDebut), "dd MMM yyyy", { locale: fr }) : "—"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-white">
                                            {calculatePrice(ab).toLocaleString("fr-FR")} <span className="text-[10px] text-slate-500">FCFA/mois</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {STATUT_CONFIG[ab.statut] && (
                                                <>
                                                    <span className={`h-1.5 w-1.5 rounded-full bg-current ${STATUT_CONFIG[ab.statut].color}`} />
                                                    <span className={`text-[10px] font-bold uppercase ${STATUT_CONFIG[ab.statut].color}`}>{ab.statut}</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            value={ab.statut}
                                            onChange={e => handleStatusChange(ab.id, "statut", e.target.value)}
                                            className="bg-[#1a2340] border border-white/10 rounded px-2 py-1 text-[10px] text-slate-400 focus:outline-none focus:border-violet-500/50"
                                        >
                                            {Object.keys(STATUT_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">Aucun abonnement</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
