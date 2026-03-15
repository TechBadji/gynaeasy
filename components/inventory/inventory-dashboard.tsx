"use client";

import { useState } from "react";
import {
    Package,
    Plus,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Trash2,
    Edit3,
    Search,
    ChevronRight,
    Filter
} from "lucide-react";
import { updateStockItem, deleteStockItem } from "@/app/actions/stock";
import toast from "react-hot-toast";

interface StockItem {
    id: string;
    nom: string;
    quantite: number;
    unite: string;
    seuilAlerte: number;
    categorie: string | null;
    derniereModif: Date;
}

export default function InventoryDashboard({ initialItems }: { initialItems: StockItem[] }) {
    const [items, setItems] = useState(initialItems);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        nom: "",
        quantite: 0,
        unite: "UNITE",
        seuilAlerte: 5,
        categorie: "Imagerie"
    });

    const categories = ["Imagerie", "Sanitaire", "Bureau", "Médical"];

    const handleOpenModal = (item?: StockItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nom: item.nom,
                quantite: item.quantite,
                unite: item.unite,
                seuilAlerte: item.seuilAlerte,
                categorie: item.categorie || "Imagerie"
            });
        } else {
            setEditingItem(null);
            setFormData({ nom: "", quantite: 0, unite: "UNITE", seuilAlerte: 5, categorie: "Imagerie" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const res = await updateStockItem(editingItem?.id || null, formData);
            if (res.success) {
                toast.success(editingItem ? "Article mis à jour" : "Article créé");
                setIsModalOpen(false);
                window.location.reload(); // Simplifié pour le moment
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet article ?")) return;
        try {
            const res = await deleteStockItem(id);
            if (res.success) {
                toast.success("Article supprimé");
                setItems(items.filter(i => i.id !== id));
            }
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const filteredItems = items.filter(i => i.nom.toLowerCase().includes(searchQuery.toLowerCase()));
    const lowStockCount = items.filter(i => i.quantite <= i.seuilAlerte).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventaire Consommables</h1>
                    <p className="text-slate-500 text-sm">Gérez les stocks de gel, papier et fournitures du cabinet</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus className="h-4 w-4" />
                    Nouvel Article
                </button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Articles</p>
                        <h3 className="text-2xl font-black text-slate-900">{items.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-400" />
                    </div>
                </div>
                <div className={`${lowStockCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'} p-6 rounded-2xl border shadow-sm flex items-center justify-between transition-colors`}>
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Alertes Stock Bas</p>
                        <h3 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{lowStockCount}</h3>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-100' : 'bg-slate-50'}`}>
                        <AlertTriangle className={`h-6 w-6 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                    </div>
                </div>
                <div className="bg-emerald-600 p-6 rounded-2xl shadow-lg shadow-emerald-50 flex items-center justify-between text-white">
                    <div>
                        <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1">Dernière Livraison</p>
                        <h3 className="text-xl font-black">Hier (14:30)</h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Liste & Recherche */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un consommable..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-lg flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filtrer
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Article</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catégorie</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Quantité</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">État</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredItems.map((item) => {
                                const isLow = item.quantite <= item.seuilAlerte;
                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${isLow ? 'bg-red-50 border-red-100 text-red-500' : 'bg-indigo-50 border-indigo-100 text-indigo-500'}`}>
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <span className="font-bold text-slate-900">{item.nom}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                                                {item.categorie}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-sm font-black ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                                                {item.quantite}
                                            </span>
                                            <span className="ml-1 text-[10px] font-bold text-slate-400 uppercase">{item.unite}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isLow ? (
                                                <div className="flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase">
                                                    <TrendingDown className="h-3 w-3" />
                                                    Stock Critique
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                                                    <TrendingUp className="h-3 w-3" />
                                                    Optimal
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">
                                {editingItem ? "Modifier l'article" : "Nouvel article"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">Fermer</button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nom de l'article</label>
                                    <input
                                        type="text"
                                        value={formData.nom}
                                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="Ex: Gel Écho Flacon 250ml"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantité</label>
                                        <input
                                            type="number"
                                            value={formData.quantite}
                                            onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unité</label>
                                        <select
                                            value={formData.unite}
                                            onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
                                        >
                                            <option value="UNITE">Unité</option>
                                            <option value="FLACON">Flacon</option>
                                            <option value="ROULEAU">Rouleau</option>
                                            <option value="BOITE">Boîte</option>
                                            <option value="PAQUET">Paquet</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Seuil d'alerte</label>
                                    <input
                                        type="number"
                                        value={formData.seuilAlerte}
                                        onChange={(e) => setFormData({ ...formData, seuilAlerte: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Vous serez alerté quand le stock descendra sous ce seuil.</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Catégorie</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, categorie: c })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formData.categorie === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl text-sm font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                            >
                                {editingItem ? "Sauvegarder" : "Créer l'article"}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
