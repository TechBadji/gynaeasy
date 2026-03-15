"use client";

import { useState, useTransition } from "react";
import { updateUserRoleAdmin, toggleUserModule, createUserAdmin } from "@/app/actions/superadmin";
import { Users, Search, ChevronDown, CheckCircle2, AlertCircle, Shield, Zap, Plus, X, Lock, Mail, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const ROLE_COLORS: Record<string, string> = {
    ADMIN: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    MEDECIN: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    SECRETAIRE: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const PLAN_COLORS: Record<string, string> = {
    PREMIUM: "text-amber-400",
    PRO: "text-violet-400",
    BASIQUE: "text-slate-400",
};

export default function SuperAdminUsers({ users, searchQuery }: { users: any[]; searchQuery: string }) {
    const [localUsers, setLocalUsers] = useState(users);
    const [isPending, startTransition] = useTransition();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Form state for creation
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "MEDECIN" as "MEDECIN" | "SECRETAIRE" | "ADMIN"
    });

    const filtered = localUsers.filter((u) => {
        const q = searchQuery.toLowerCase();
        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
    });

    const handleRoleChange = (userId: string, role: "MEDECIN" | "SECRETAIRE" | "ADMIN") => {
        startTransition(async () => {
            try {
                await updateUserRoleAdmin(userId, role);
                setLocalUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
                toast.success("Rôle mis à jour");
                setEditingId(null);
            } catch {
                toast.error("Erreur lors de la mise à jour");
            }
        });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                const res = await createUserAdmin(newUser);
                setLocalUsers([res, ...localUsers]);
                toast.success("Compte créé avec succès");
                setIsCreateModalOpen(false);
                setNewUser({ name: "", email: "", password: "", role: "MEDECIN" });
            } catch (err: any) {
                toast.error(err.message || "Erreur lors de la création");
            }
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
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patients</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultations</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Abonnement</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Modules Actifs</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Inscrit le</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length > 0 ? filtered.map((user) => {
                                const ab = user.abonnements?.[0];
                                return (
                                    <tr key={user.id} className="hover:bg-white/3 transition-colors">
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
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role] || ""}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">{user._count?.patients ?? 0}</td>
                                        <td className="px-4 py-3 text-slate-300">{user._count?.consultations ?? 0}</td>
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
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {["AGENDA", "PATIENTS", "IMAGERIE", "TELEMEDECINE"].map((mod) => {
                                                    const isEnabled = user.enabledModules?.includes(mod);
                                                    return (
                                                        <button
                                                            key={mod}
                                                            onClick={() => {
                                                                startTransition(async () => {
                                                                    try {
                                                                        await toggleUserModule(user.id, mod);
                                                                        setLocalUsers(prev => prev.map(u => u.id === user.id ? {
                                                                            ...u,
                                                                            enabledModules: isEnabled ? u.enabledModules.filter((m: string) => m !== mod) : [...(u.enabledModules || []), mod]
                                                                        } : u));
                                                                        toast.success(`${mod} ${isEnabled ? 'désactivé' : 'activé'}`);
                                                                    } catch {
                                                                        toast.error("Erreur action module");
                                                                    }
                                                                });
                                                            }}
                                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all border ${isEnabled ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700/50 text-slate-500 border-white/5 opacity-50 hover:opacity-100'}`}
                                                        >
                                                            {mod}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-400 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                                                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white border border-white/10 rounded-md px-2 py-1 hover:border-white/30 transition-all"
                                                >
                                                    Rôle <ChevronDown className="h-3 w-3" />
                                                </button>
                                                {editingId === user.id && (
                                                    <div className="absolute right-0 top-8 z-50 bg-[#1a2340] border border-white/20 rounded-lg shadow-2xl overflow-hidden w-40">
                                                        {["MEDECIN", "SECRETAIRE", "ADMIN"].map((role) => (
                                                            <button
                                                                key={role}
                                                                onClick={() => handleRoleChange(user.id, role as any)}
                                                                disabled={isPending || user.role === role}
                                                                className={`w-full text-left px-4 py-2.5 text-xs hover:bg-white/10 transition-colors ${user.role === role ? "text-violet-400 font-semibold" : "text-slate-300"}`}
                                                            >
                                                                {role}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de création */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0a0f1e]/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="bg-[#151c2e] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
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
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nom complet</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Dr. Nom Prénom"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Adresse Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input
                                        required
                                        type="email"
                                        placeholder="email@gynaeasy.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Mot de passe provisoire</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                    <input
                                        required
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Rôle de l'utilisateur</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["MEDECIN", "SECRETAIRE", "ADMIN"] as const).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setNewUser({ ...newUser, role: r })}
                                            className={`py-2 rounded-lg text-[10px] font-black tracking-tighter transition-all border ${newUser.role === r ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                        >
                                            {r === "MEDECIN" ? "MÉDECIN" : r === "SECRETAIRE" ? "SECRÉTAIRE" : "ADMIN"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white py-4 rounded-xl font-black text-sm shadow-xl shadow-violet-500/20 transition-all mt-4 disabled:opacity-50"
                            >
                                {isPending ? "Création en cours..." : "Créer le compte"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
