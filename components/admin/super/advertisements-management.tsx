"use client";

import { useState, useTransition } from "react";
import { createAdvertisement, updateAdvertisement, deleteAdvertisement } from "@/app/actions/superadmin";
import { Plus, Trash, Edit, CheckCircle2, RotateCcw, Link as LinkIcon, Image as ImageIcon, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function SuperAdminAdvertisements({ advertisements }: { advertisements: any[] }) {
    const [list, setList] = useState(advertisements);
    const [isPending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    
    // Form state
    const [newAd, setNewAd] = useState({
        partenaire: "",
        titre: "",
        description: "",
        imageUrl: "",
        lienClick: "",
        dateDebut: "",
        dateFin: "",
        prixParJour: 0,
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null);

    const handleCreate = () => {
        if (!newAd.partenaire || !newAd.titre || !newAd.dateDebut || !newAd.dateFin || newAd.prixParJour <= 0) {
            toast.error("Veuillez remplir tous les champs obligatoires (Partenaire, Titre, Dates, Prix)");
            return;
        }

        startTransition(async () => {
            try {
                const created = await createAdvertisement({
                    ...newAd,
                    dateDebut: new Date(newAd.dateDebut),
                    dateFin: new Date(newAd.dateFin),
                });
                setList((prev) => [created, ...prev]);
                toast.success("Campagne créée avec succès");
                setCreating(false);
                setNewAd({
                    partenaire: "",
                    titre: "",
                    description: "",
                    imageUrl: "",
                    lienClick: "",
                    dateDebut: "",
                    dateFin: "",
                    prixParJour: 0,
                });
            } catch (err: any) {
                toast.error(err.message || "Erreur lors de la création");
            }
        });
    };

    const handleUpdate = (id: string) => {
        startTransition(async () => {
            try {
                const updated = await updateAdvertisement(id, editData);
                setList((prev) => prev.map((ad) => (ad.id === id ? updated : ad)));
                setEditingId(null);
                toast.success("Campagne mise à jour");
            } catch {
                toast.error("Erreur lors de la mise à jour");
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette campagne ?")) return;
        startTransition(async () => {
            try {
                await deleteAdvertisement(id);
                setList((prev) => prev.filter((ad) => ad.id !== id));
                toast.success("Campagne supprimée");
            } catch {
                toast.error("Erreur lors de la suppression");
            }
        });
    };

    const toggleStatus = (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "ACTIF" ? "PAUSE" : "ACTIF";
        startTransition(async () => {
            try {
                const updated = await updateAdvertisement(id, { statut: newStatus });
                setList((prev) => prev.map((ad) => (ad.id === id ? updated : ad)));
                toast.success(`Statut modifié: ${newStatus}`);
            } catch {
                toast.error("Erreur");
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Campagnes Publicitaires</h1>
                    <p className="text-slate-400 text-sm mt-1">Gérez les encarts pub partenaires affichés aux médecins</p>
                </div>
                <button
                    onClick={() => setCreating(!creating)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle Campagne
                </button>
            </div>

            {creating && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold text-white mb-4">Créer une Campagne</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Partenaire (Obligatoire)</label>
                            <input
                                type="text"
                                value={newAd.partenaire}
                                onChange={(e) => setNewAd({ ...newAd, partenaire: e.target.value })}
                                placeholder="Gynaeasy / Sanofi / ..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Titre (Obligatoire)</label>
                            <input
                                type="text"
                                value={newAd.titre}
                                onChange={(e) => setNewAd({ ...newAd, titre: e.target.value })}
                                placeholder="Besoin de matériel ?"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-slate-400 mb-1 block">Description</label>
                            <input
                                type="text"
                                value={newAd.description}
                                onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                                placeholder="Découvrez notre nouvelle offre spéciale."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><ImageIcon className="h-3 w-3"/> Image URL</label>
                            <input
                                type="text"
                                value={newAd.imageUrl}
                                onChange={(e) => setNewAd({ ...newAd, imageUrl: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><LinkIcon className="h-3 w-3"/> Lien URL (Clic)</label>
                            <input
                                type="text"
                                value={newAd.lienClick}
                                onChange={(e) => setNewAd({ ...newAd, lienClick: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Début</label>
                            <input
                                type="date"
                                value={newAd.dateDebut}
                                onChange={(e) => setNewAd({ ...newAd, dateDebut: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Fin</label>
                            <input
                                type="date"
                                value={newAd.dateFin}
                                onChange={(e) => setNewAd({ ...newAd, dateFin: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Prix / Jour (FCFA)</label>
                            <input
                                type="number"
                                value={newAd.prixParJour}
                                onChange={(e) => setNewAd({ ...newAd, prixParJour: parseFloat(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-slate-400 font-medium hover:text-white">Annuler</button>
                        <button onClick={handleCreate} disabled={isPending} className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                            Créer la campagne
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-white/5 text-xs uppercase font-semibold text-slate-400">
                        <tr>
                            <th className="px-6 py-4">Campagne</th>
                            <th className="px-6 py-4">Partenaire</th>
                            <th className="px-6 py-4">Période</th>
                            <th className="px-6 py-4">Revenus (FCFA)</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {list.map((ad) => (
                            <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white truncate max-w-[200px]">{ad.titre}</div>
                                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{ad.description}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-800 text-xs px-2 py-1 rounded-md">{ad.partenaire}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(ad.dateDebut).toLocaleDateString()} - {new Date(ad.dateFin).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-emerald-400">{ad.prixTotal?.toLocaleString()} FCFA</div>
                                    <div className="text-[10px] text-slate-500">{ad.prixParJour} / jour</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${ad.statut === "ACTIF" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ad.statut === "PAUSE" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"}`}>
                                        {ad.statut}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => toggleStatus(ad.id, ad.statut)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title={ad.statut === "ACTIF" ? "Mettre en pause" : "Activer"}>
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(ad.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all" title="Supprimer">
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                                    Aucune campagne trouvée
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
