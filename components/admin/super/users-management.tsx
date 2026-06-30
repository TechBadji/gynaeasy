"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { updateUserRoleAdmin, toggleUserModule, createUserAdmin, setUserStatusAdmin, deleteUserAdmin, setUser2FARequired, linkSecretaryToDoctor } from "@/app/actions/superadmin";
import { Users, Search, ChevronDown, CheckCircle2, AlertCircle, Shield, ShieldCheck, ShieldOff, Plus, X, Lock, Mail, UserPlus, Ban, UserCheck, Trash2, Link2, Link2Off } from "lucide-react";
import toast from "react-hot-toast";

const ROLE_COLORS: Record<string, string> = {
    ADMIN:      "bg-violet-500/20 text-violet-300 border-violet-500/30",
    MEDECIN:    "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    SECRETAIRE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const PLAN_COLORS: Record<string, string> = {
    CLINIQUE: "text-amber-400",
    PRO:      "text-violet-400",
    SOLO:     "text-slate-400",
};

export default function SuperAdminUsers({ users, searchQuery }: { users: any[]; searchQuery: string }) {
    const [localUsers, setLocalUsers]         = useState(users);
    const [isPending, startTransition]        = useTransition();
    const [editingId, setEditingId]           = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [linkingId, setLinkingId]           = useState<string | null>(null);
    const [newUser, setNewUser] = useState({
        name: "", email: "", password: "",
        role: "MEDECIN" as "MEDECIN" | "SECRETAIRE" | "ADMIN",
        linkedDoctorId: "",
    });
    const doctorSectionRef = useRef<HTMLDivElement>(null);

    // Scroll la section médecin dans le viewport dès qu'elle apparaît
    useEffect(() => {
        if (newUser.role === "SECRETAIRE" && doctorSectionRef.current) {
            doctorSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [newUser.role]);

    // Médecins disponibles pour rattachement
    const medecins = localUsers.filter(u => u.role === "MEDECIN");

    const filtered = localUsers.filter((u) => {
        const q = searchQuery.toLowerCase();
        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
    });

    const handleRoleChange = (userId: string, role: "MEDECIN" | "SECRETAIRE" | "ADMIN") => {
        startTransition(async () => {
            const res = await updateUserRoleAdmin(userId, role);
            if (res.success) {
                setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
                toast.success("Rôle mis à jour");
                setEditingId(null);
            } else toast.error(res.error || "Erreur");
        });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const res = await createUserAdmin({
                name:           newUser.name,
                email:          newUser.email,
                password:       newUser.password,
                role:           newUser.role,
                linkedDoctorId: newUser.role === "SECRETAIRE" && newUser.linkedDoctorId ? newUser.linkedDoctorId : undefined,
            });
            if (res.success) {
                setLocalUsers([res.data, ...localUsers]);
                toast.success("Compte créé avec succès");
                setIsCreateModalOpen(false);
                setNewUser({ name: "", email: "", password: "", role: "MEDECIN", linkedDoctorId: "" });
            } else toast.error(res.error || "Erreur lors de la création");
        });
    };

    const handleLinkDoctor = (secretaryId: string, doctorId: string | null) => {
        startTransition(async () => {
            const res = await linkSecretaryToDoctor(secretaryId, doctorId);
            if (res.success) {
                setLocalUsers(prev => prev.map(u => u.id === secretaryId
                    ? { ...u, linkedDoctorId: res.data.linkedDoctorId, linkedDoctor: res.data.linkedDoctor }
                    : u
                ));
                toast.success(doctorId ? "Médecin rattaché" : "Rattachement retiré");
                setLinkingId(null);
            } else toast.error(res.error || "Erreur");
        });
    };

    const handleBlockToggle = (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";
        startTransition(async () => {
            const res = await setUserStatusAdmin(userId, newStatus as any);
            if (res.success) {
                setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
                toast.success(`Utilisateur ${newStatus === "BLOCKED" ? "bloqué" : "activé"}`);
            } else toast.error(res.error || "Erreur");
        });
    };

    const handleToggle2FA = (userId: string, current: boolean) => {
        startTransition(async () => {
            const res = await setUser2FARequired(userId, !current);
            if (res.success) {
                setLocalUsers(prev => prev.map(u => u.id === userId ? { ...u, twoFactorRequired: !current } : u));
                toast.success(`2FA ${!current ? "exigée" : "non exigée"}`);
            } else toast.error(res.error || "Erreur");
        });
    };

    const handleDelete = (userId: string, userName: string) => {
        if (!confirm(`Supprimer définitivement le compte de ${userName} ?`)) return;
        startTransition(async () => {
            const res = await deleteUserAdmin(userId);
            if (res.success) {
                setLocalUsers(prev => prev.filter(u => u.id !== userId));
                toast.success("Compte supprimé");
            } else toast.error(res.error || "Suppression impossible");
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h1>
                    <p className="text-slate-400 text-sm mt-1">{localUsers.length} compte(s) enregistré(s)</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 transition-all border border-white/10"
                >
                    <Plus className="h-4 w-4" />
                    Créer un compte
                </button>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                    <Users className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-medium text-white">Tous les comptes</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rôle</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Médecin rattaché</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patients</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Abonnement</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Modules</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">2FA</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Inscrit</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length > 0 ? filtered.map((user) => {
                                const ab = user.abonnements?.[0];
                                return (
                                    <tr key={user.id} className="hover:bg-white/3 transition-colors">
                                        {/* Utilisateur */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {user.name?.[0] || user.email?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{user.name || "—"}</p>
                                                    <p className="text-xs text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Rôle */}
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role] || ""}`}>
                                                {user.role === "SECRETAIRE" ? "SECRÉTAIRE" : user.role}
                                            </span>
                                        </td>
                                        {/* Médecin rattaché */}
                                        <td className="px-4 py-3">
                                            {user.role === "SECRETAIRE" ? (
                                                <div className="space-y-1">
                                                    {user.linkedDoctor ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-5 w-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[9px] font-bold text-cyan-300 flex-shrink-0">
                                                                {user.linkedDoctor.name?.[0]}
                                                            </div>
                                                            <span className="text-xs text-cyan-300 font-medium">{user.linkedDoctor.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 font-bold">
                                                            Non rattaché
                                                        </span>
                                                    )}
                                                    {/* Popover sélecteur médecin */}
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setLinkingId(linkingId === user.id ? null : user.id)}
                                                            className="flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-violet-400 transition-colors"
                                                        >
                                                            <Link2 className="h-2.5 w-2.5" />
                                                            {user.linkedDoctor ? "Changer" : "Rattacher"}
                                                        </button>
                                                        {linkingId === user.id && (
                                                            <div className="absolute left-0 top-6 z-50 bg-[#151c2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden w-52">
                                                                <div className="p-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/5 px-3 py-2">
                                                                    Choisir un médecin
                                                                </div>
                                                                {user.linkedDoctor && (
                                                                    <button
                                                                        onClick={() => handleLinkDoctor(user.id, null)}
                                                                        className="w-full text-left px-3 py-2.5 text-[10px] font-bold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-b border-white/5"
                                                                    >
                                                                        <Link2Off className="h-3 w-3" />
                                                                        Retirer le rattachement
                                                                    </button>
                                                                )}
                                                                {medecins.length === 0 && (
                                                                    <p className="px-3 py-3 text-[10px] text-slate-500 italic">Aucun médecin disponible</p>
                                                                )}
                                                                {medecins.map(doc => (
                                                                    <button
                                                                        key={doc.id}
                                                                        onClick={() => handleLinkDoctor(user.id, doc.id)}
                                                                        disabled={isPending}
                                                                        className={`w-full text-left px-3 py-2.5 text-[10px] font-bold transition-colors flex items-center gap-2 border-b border-white/5 last:border-0 ${user.linkedDoctorId === doc.id ? "text-violet-400 bg-violet-400/5" : "text-slate-300 hover:bg-white/5"}`}
                                                                    >
                                                                        <div className="h-4 w-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[8px] font-bold text-cyan-300 flex-shrink-0">
                                                                            {doc.name?.[0]}
                                                                        </div>
                                                                        {doc.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-600">—</span>
                                            )}
                                        </td>
                                        {/* Patients */}
                                        <td className="px-4 py-3 text-slate-300">{user._count?.patients ?? 0}</td>
                                        {/* Abonnement */}
                                        <td className="px-4 py-3">
                                            {ab ? (
                                                <div>
                                                    <span className={`text-xs font-semibold ${PLAN_COLORS[ab.plan] || "text-slate-400"}`}>{ab.plan}</span>
                                                    {ab.statut === "ACTIF"
                                                        ? <CheckCircle2 className="inline h-3 w-3 ml-1 text-emerald-400" />
                                                        : <AlertCircle className="inline h-3 w-3 ml-1 text-amber-400" />
                                                    }
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500 italic">Aucun</span>
                                            )}
                                        </td>
                                        {/* Modules */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {["AGENDA", "PATIENTS", "IMAGERIE", "TELEMEDECINE"].map((mod) => {
                                                    const isEnabled = user.enabledModules?.includes(mod);
                                                    return (
                                                        <button
                                                            key={mod}
                                                            onClick={() => startTransition(async () => {
                                                                const res = await toggleUserModule(user.id, mod);
                                                                if (res.success) setLocalUsers(prev => prev.map(u => u.id === user.id ? res.data : u));
                                                                else toast.error(res.error || "Erreur module");
                                                            })}
                                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all border ${isEnabled ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-700/50 text-slate-500 border-white/5 opacity-50 hover:opacity-100"}`}
                                                        >
                                                            {mod}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        {/* 2FA */}
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                {user.twoFactorEnabled
                                                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5"><ShieldCheck className="h-3 w-3" /> Activée</span>
                                                    : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-700/50 border border-white/5 rounded-full px-2 py-0.5"><ShieldOff className="h-3 w-3" /> Inactive</span>
                                                }
                                                <button
                                                    onClick={() => handleToggle2FA(user.id, user.twoFactorRequired)}
                                                    className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-full px-2 py-0.5 border transition-all ${user.twoFactorRequired ? "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"}`}
                                                >
                                                    <Shield className="h-2.5 w-2.5" />
                                                    {user.twoFactorRequired ? "Exigée" : "Exiger"}
                                                </button>
                                            </div>
                                        </td>
                                        {/* Date */}
                                        <td className="px-4 py-3 text-slate-400 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                                                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white border border-white/10 rounded-lg px-2 py-1.5 hover:border-white/30 transition-all uppercase tracking-tighter"
                                                    >
                                                        Rôle <ChevronDown className="h-3 w-3" />
                                                    </button>
                                                    {editingId === user.id && (
                                                        <div className="absolute right-0 top-10 z-50 bg-[#151c2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden w-40 backdrop-blur-xl">
                                                            {(["MEDECIN", "SECRETAIRE", "ADMIN"] as const).map((role) => (
                                                                <button
                                                                    key={role}
                                                                    onClick={() => handleRoleChange(user.id, role)}
                                                                    disabled={isPending || user.role === role}
                                                                    className={`w-full text-left px-4 py-3 text-[10px] font-bold transition-colors border-b border-white/5 last:border-0 ${user.role === role ? "text-violet-400 bg-violet-400/5" : "text-slate-300 hover:bg-white/5"}`}
                                                                >
                                                                    {role === "SECRETAIRE" ? "SECRÉTAIRE" : role}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleBlockToggle(user.id, user.status)}
                                                    title={user.status === "BLOCKED" ? "Débloquer" : "Bloquer"}
                                                    className={`p-2 rounded-lg border transition-all ${user.status === "BLOCKED" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" : "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20"}`}
                                                >
                                                    {user.status === "BLOCKED" ? <UserCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name || user.email)}
                                                    title="Supprimer"
                                                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">Aucun utilisateur trouvé</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal de création ──────────────────────────────────────── */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0a0f1e]/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="bg-[#151c2e] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-y-auto max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 bg-white/3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                    <UserPlus className="h-5 w-5 text-violet-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Nouveau Compte</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ajouter un utilisateur</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {/* ① Rôle — en premier pour révéler immédiatement le sélecteur médecin */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Rôle</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["MEDECIN", "SECRETAIRE", "ADMIN"] as const).map((r) => (
                                        <button key={r} type="button"
                                            onClick={() => setNewUser({ ...newUser, role: r, linkedDoctorId: "" })}
                                            className={`py-3 rounded-xl text-[10px] font-black tracking-tighter transition-all border ${newUser.role === r ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20" : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 hover:border-white/20"}`}>
                                            {r === "MEDECIN" ? "MÉDECIN" : r === "SECRETAIRE" ? "SECRÉTAIRE" : "ADMIN"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ② Médecin rattaché — apparaît immédiatement sous les boutons de rôle */}
                            {newUser.role === "SECRETAIRE" && (
                                <div ref={doctorSectionRef} className="space-y-2 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                                    <label className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1">
                                        Médecin rattaché <span className="text-red-400">*</span>
                                    </label>
                                    {medecins.length === 0 ? (
                                        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                                            Aucun médecin disponible — créez d&apos;abord un compte médecin.
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {medecins.map(doc => (
                                                <button
                                                    key={doc.id}
                                                    type="button"
                                                    onClick={() => setNewUser({ ...newUser, linkedDoctorId: doc.id })}
                                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                                                        newUser.linkedDoctorId === doc.id
                                                            ? "bg-violet-600/30 border-violet-500/60 shadow-md"
                                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                                    }`}
                                                >
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                                        newUser.linkedDoctorId === doc.id ? "bg-violet-500 text-white" : "bg-cyan-500/20 text-cyan-300"
                                                    }`}>
                                                        {doc.name?.[0] ?? "D"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{doc.name}</p>
                                                        <p className="text-[10px] text-slate-400">{doc.email}</p>
                                                    </div>
                                                    {newUser.linkedDoctorId === doc.id && (
                                                        <CheckCircle2 className="h-4 w-4 text-violet-400 ml-auto flex-shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ③ Informations personnelles */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input required type="text" placeholder={newUser.role === "MEDECIN" ? "Dr. Nom Prénom" : "Nom Prénom"}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                        value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input required type="email" placeholder="email@gynaeasy.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                        value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mot de passe provisoire</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input required type="password" placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                        value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" disabled={isPending}
                                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-violet-500/20 transition-all mt-4 disabled:opacity-50">
                                {isPending ? "Création en cours..." : "Créer le compte"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
