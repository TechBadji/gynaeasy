"use client";

import { useState } from "react";
import { updateUserRole } from "@/app/actions/settings";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog, User, ShieldAlert } from "lucide-react";

export default function StaffManagement({ users }: { users: any[] }) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur en ${newRole} ?`)) return;

        setLoading(userId);
        try {
            await updateUserRole(userId, newRole as any);
            toast.success("Rôle mis à jour");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setLoading(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-pink-600" />
                    Gestion du Personnel
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Utilisateur</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                <th className="px-6 py-3 font-medium">Rôle actuel</th>
                                <th className="px-6 py-3 font-medium text-right">Modifier le rôle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="h-4 w-4" />
                                        </div>
                                        {user.name || "Inconnu"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                                                user.role === "MEDECIN" ? "bg-blue-100 text-blue-800" :
                                                    "bg-slate-100 text-slate-800"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <select
                                            disabled={loading === user.id}
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="text-xs border rounded-md p-1 focus:ring-1 focus:ring-pink-500 focus:outline-none bg-white font-medium cursor-pointer"
                                        >
                                            <option value="MEDECIN">Médecin</option>
                                            <option value="SECRETAIRE">Secrétaire</option>
                                            <option value="ADMIN">Administrateur</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-bold">Attention</p>
                        <p>Les changements de rôle affectent immédiatement les permissions d'accès aux dossiers patients et aux paramètres d'administration.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
