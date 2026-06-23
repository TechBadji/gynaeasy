"use client";

import { useState, useMemo } from "react";
import {
    Package, Plus, AlertTriangle, Search, Edit3, Trash2,
    ChevronRight, Minus, CheckCircle2, Activity, Printer,
    Stethoscope, FileText, Droplets, ShieldCheck, Layers,
    TrendingUp, X, Clock,
} from "lucide-react";
import { updateStockItem, deleteStockItem, adjustStockQuantity } from "@/app/actions/stock";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface StockItem {
    id: string;
    nom: string;
    quantite: number;
    unite: string;
    seuilAlerte: number;
    categorie: string | null;
    derniereModif: Date;
}

// ─── Config catégories ─────────────────────────────────────────────────────
const CATEGORIES = [
    { key: "Imagerie",  label: "Imagerie",  icon: Activity    },
    { key: "Sanitaire", label: "Sanitaire", icon: ShieldCheck },
    { key: "Médical",   label: "Médical",   icon: Stethoscope },
    { key: "Bureau",    label: "Bureau",    icon: FileText    },
    { key: "Hygiène",   label: "Hygiène",   icon: Droplets    },
] as const;

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string; badgeText: string }> = {
    Imagerie:   { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200",  badge: "bg-violet-100",  badgeText: "text-violet-700"  },
    Sanitaire:  { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200",    badge: "bg-blue-100",    badgeText: "text-blue-700"    },
    Médical:    { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", badge: "bg-emerald-100", badgeText: "text-emerald-700" },
    Bureau:     { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200",   badge: "bg-amber-100",   badgeText: "text-amber-700"   },
    Hygiène:    { bg: "bg-cyan-50",    text: "text-cyan-600",    border: "border-cyan-200",    badge: "bg-cyan-100",    badgeText: "text-cyan-700"    },
};

// ─── Articles suggérés par catégorie ──────────────────────────────────────
const SUGGESTIONS: Record<string, string[]> = {
    Imagerie:  ["Gel d'échographie 5L", "Gel d'échographie 250ml", "Papier thermique écho", "Housses de sonde", "Film plastique rouleaux"],
    Sanitaire: ["Gants nitrile S", "Gants nitrile M", "Gants nitrile L", "Gants vinyle M", "Masques chirurgicaux", "Compresses stériles 10x10", "Champs stériles"],
    Médical:   ["Spéculums petits", "Spéculums moyens", "Spéculums grands", "Bandelettes urinaires", "Lames Pap-test", "Fixateur cytologie", "Brossettes col utérin", "Seringues 5ml", "Aiguilles 21G"],
    Bureau:    ["Papier A4 rame", "Ordonnanciers", "Stylos", "Cartouches imprimante", "Registre patients"],
    Hygiène:   ["Savon désinfectant 500ml", "Essuie-mains bobines", "SHA 500ml", "Poubelles DASRI", "Conteneurs sharps"],
};

const UNITES = ["UNITE", "FLACON", "ROULEAU", "BOITE", "PAQUET", "SACHET", "RAME"];
const UNITE_LABELS: Record<string, string> = {
    UNITE: "Unité", FLACON: "Flacon", ROULEAU: "Rouleau",
    BOITE: "Boîte", PAQUET: "Paquet", SACHET: "Sachet", RAME: "Rame",
};

function stockLevel(item: StockItem): "ok" | "low" | "critical" {
    if (item.quantite <= item.seuilAlerte) return "critical";
    if (item.quantite <= item.seuilAlerte * 2) return "low";
    return "ok";
}

function StockBar({ item }: { item: StockItem }) {
    const max = Math.max(item.seuilAlerte * 4, item.quantite, 1);
    const pct = Math.min(100, (item.quantite / max) * 100);
    const level = stockLevel(item);
    const barColor = level === "critical" ? "bg-red-500" : level === "low" ? "bg-amber-400" : "bg-emerald-500";
    return (
        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
    );
}

function StatusBadge({ item }: { item: StockItem }) {
    const level = stockLevel(item);
    if (level === "critical") return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />Critique
        </span>
    );
    if (level === "low") return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Stock bas
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="h-2.5 w-2.5" />Optimal
        </span>
    );
}

// ─── Composant principal ──────────────────────────────────────────────────
export default function InventoryDashboard({ initialItems }: { initialItems: StockItem[] }) {
    const [items, setItems] = useState<StockItem[]>(initialItems);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRestockOpen, setIsRestockOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [restockItem, setRestockItem] = useState<StockItem | null>(null);
    const [restockQty, setRestockQty] = useState(10);
    const [adjusting, setAdjusting] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [form, setForm] = useState({
        nom: "", quantite: 0, unite: "UNITE", seuilAlerte: 5, categorie: "Imagerie",
    });

    // ─── Stats ─────────────────────────────────────────────────────────────
    const critical = useMemo(() => items.filter(i => i.quantite <= i.seuilAlerte), [items]);
    const lowStock  = useMemo(() => items.filter(i => stockLevel(i) === "low"), [items]);
    const lastModif = useMemo(() => {
        if (!items.length) return null;
        return items.reduce((a, b) => new Date(a.derniereModif) > new Date(b.derniereModif) ? a : b);
    }, [items]);

    // ─── Filtrage ──────────────────────────────────────────────────────────
    const filtered = useMemo(() => items.filter(i => {
        const matchSearch = i.nom.toLowerCase().includes(search.toLowerCase());
        const matchCat = !activeCategory || i.categorie === activeCategory;
        return matchSearch && matchCat;
    }), [items, search, activeCategory]);

    const countByCategory = useMemo(() =>
        Object.fromEntries(CATEGORIES.map(c => [c.key, items.filter(i => i.categorie === c.key).length])),
        [items]
    );

    // ─── Handlers ──────────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingItem(null);
        setForm({ nom: "", quantite: 0, unite: "UNITE", seuilAlerte: 5, categorie: "Imagerie" });
        setShowSuggestions(false);
        setIsModalOpen(true);
    };

    const openEdit = (item: StockItem) => {
        setEditingItem(item);
        setForm({ nom: item.nom, quantite: item.quantite, unite: item.unite, seuilAlerte: item.seuilAlerte, categorie: item.categorie || "Imagerie" });
        setShowSuggestions(false);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.nom.trim()) { toast.error("Nom requis"); return; }
        try {
            const res = await updateStockItem(editingItem?.id || null, form);
            if (!res.success) { toast.error("Erreur lors de la sauvegarde"); return; }
            toast.success(editingItem ? "Article mis à jour" : "Article créé");
            setIsModalOpen(false);
            if (editingItem) {
                setItems(prev => prev.map(i => i.id === editingItem.id
                    ? { ...i, ...form, derniereModif: new Date() } : i));
            } else {
                window.location.reload();
            }
        } catch (e: any) { toast.error(e.message); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet article ?")) return;
        try {
            const res = await deleteStockItem(id);
            if (res.success) {
                toast.success("Article supprimé");
                setItems(prev => prev.filter(i => i.id !== id));
            }
        } catch (e: any) { toast.error(e.message); }
    };

    const handleAdjust = async (id: string, delta: number) => {
        setAdjusting(id);
        try {
            const res = await adjustStockQuantity(id, delta);
            if (res.success) {
                setItems(prev => prev.map(i => i.id === id
                    ? { ...i, quantite: res.quantite!, derniereModif: new Date() } : i));
            }
        } catch (e: any) { toast.error(e.message); }
        finally { setAdjusting(null); }
    };

    const handleRestock = async () => {
        if (!restockItem || restockQty <= 0) return;
        try {
            const res = await adjustStockQuantity(restockItem.id, restockQty);
            if (res.success) {
                setItems(prev => prev.map(i => i.id === restockItem.id
                    ? { ...i, quantite: res.quantite!, derniereModif: new Date() } : i));
                toast.success(`+${restockQty} ${UNITE_LABELS[restockItem.unite] || restockItem.unite} ajouté(s)`);
                setIsRestockOpen(false);
            }
        } catch (e: any) { toast.error(e.message); }
    };

    const catColors = (key: string) => CATEGORY_COLORS[key] ?? CATEGORY_COLORS["Bureau"];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventaire Consommables</h1>
                    <p className="text-slate-500 text-sm">Gérez les stocks de votre cabinet — gel, consommables, matériel médical</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-violet-600 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-100"
                >
                    <Plus className="h-4 w-4" />
                    Nouvel Article
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Articles</p>
                        <p className="text-3xl font-black text-slate-900">{items.length}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {CATEGORIES.filter(c => countByCategory[c.key] > 0).length} catégorie{CATEGORIES.filter(c => countByCategory[c.key] > 0).length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                        <Layers className="h-6 w-6 text-violet-500" />
                    </div>
                </div>

                <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${
                    critical.length > 0 ? "bg-red-50 border-red-200" : lowStock.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"
                }`}>
                    <div>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                            critical.length > 0 ? "text-red-500" : lowStock.length > 0 ? "text-amber-500" : "text-slate-400"
                        }`}>Alertes Stock</p>
                        <p className={`text-3xl font-black ${
                            critical.length > 0 ? "text-red-700" : lowStock.length > 0 ? "text-amber-700" : "text-slate-900"
                        }`}>{critical.length + lowStock.length}</p>
                        {critical.length > 0 && (
                            <p className="text-xs text-red-500 mt-1">{critical.length} critique{critical.length > 1 ? "s" : ""}</p>
                        )}
                        {critical.length === 0 && lowStock.length > 0 && (
                            <p className="text-xs text-amber-500 mt-1">{lowStock.length} bas</p>
                        )}
                        {critical.length === 0 && lowStock.length === 0 && (
                            <p className="text-xs text-emerald-500 mt-1">Tout est optimal</p>
                        )}
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        critical.length > 0 ? "bg-red-100" : lowStock.length > 0 ? "bg-amber-100" : "bg-emerald-50"
                    }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                            critical.length > 0 ? "text-red-500" : lowStock.length > 0 ? "text-amber-500" : "text-emerald-400"
                        }`} />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dernière Mise à Jour</p>
                        {lastModif ? (
                            <>
                                <p className="text-sm font-black text-slate-900 leading-tight truncate max-w-[160px]">{lastModif.nom}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {formatDistanceToNow(new Date(lastModif.derniereModif), { locale: fr, addSuffix: true })}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-400">Aucun article</p>
                        )}
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Alertes critiques */}
            {critical.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-red-700">
                            {critical.length} article{critical.length > 1 ? "s" : ""} en rupture imminente
                        </p>
                        <p className="text-xs text-red-500 mt-0.5 truncate">{critical.map(i => i.nom).join(", ")}</p>
                    </div>
                </div>
            )}

            {/* Tableau */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                {/* Barre outils */}
                <div className="p-5 border-b border-slate-50 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un consommable..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            {filtered.length} / {items.length} article{items.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    {/* Onglets catégories */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                activeCategory === null
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                            }`}
                        >
                            <Package className="h-3 w-3" />
                            Tous
                            <span className={`text-[10px] px-1.5 rounded-full font-black ${activeCategory === null ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                                {items.length}
                            </span>
                        </button>
                        {CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            const colors = catColors(cat.key);
                            const isActive = activeCategory === cat.key;
                            const count = countByCategory[cat.key] ?? 0;
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setActiveCategory(isActive ? null : cat.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                        isActive
                                            ? `${colors.bg} ${colors.text} ${colors.border}`
                                            : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                                    }`}
                                >
                                    <Icon className="h-3 w-3" />
                                    {cat.label}
                                    <span className={`text-[10px] px-1.5 rounded-full font-black ${isActive ? `${colors.badge} ${colors.badgeText}` : "bg-slate-200 text-slate-600"}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Package className="h-10 w-10 mb-3 opacity-30" />
                            <p className="text-sm font-semibold">Aucun article trouvé</p>
                            <p className="text-xs mt-1">{search ? "Essayez un autre terme" : "Ajoutez votre premier article"}</p>
                            {!search && (
                                <button onClick={openCreate} className="mt-4 flex items-center gap-2 bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">
                                    <Plus className="h-3.5 w-3.5" />Nouvel article
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Article</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quantité</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Niveau</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">État</th>
                                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(item => {
                                    const colors = catColors(item.categorie || "Bureau");
                                    const Icon = CATEGORIES.find(c => c.key === item.categorie)?.icon ?? Package;
                                    const isAdj = adjusting === item.id;
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            {/* Article */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center border ${colors.bg} ${colors.border}`}>
                                                        <Icon className={`h-4 w-4 ${colors.text}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm">{item.nom}</p>
                                                        <p className="text-[10px] text-slate-400">Seuil: {item.seuilAlerte} {UNITE_LABELS[item.unite] ?? item.unite}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Catégorie */}
                                            <td className="px-5 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${colors.badge} ${colors.badgeText}`}>
                                                    {item.categorie || "—"}
                                                </span>
                                            </td>
                                            {/* Quantité +/- */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAdjust(item.id, -1)}
                                                        disabled={isAdj || item.quantite === 0}
                                                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-30"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <div className="text-center w-14">
                                                        <span className={`text-sm font-black ${item.quantite <= item.seuilAlerte ? "text-red-600" : "text-slate-900"}`}>
                                                            {item.quantite}
                                                        </span>
                                                        <span className="block text-[9px] font-bold text-slate-400 uppercase -mt-0.5">
                                                            {UNITE_LABELS[item.unite] ?? item.unite}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAdjust(item.id, +1)}
                                                        disabled={isAdj}
                                                        className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors disabled:opacity-30"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </td>
                                            {/* Barre niveau */}
                                            <td className="px-5 py-4">
                                                <StockBar item={item} />
                                            </td>
                                            {/* État */}
                                            <td className="px-5 py-4">
                                                <StatusBadge item={item} />
                                            </td>
                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => { setRestockItem(item); setRestockQty(10); setIsRestockOpen(true); }}
                                                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold text-violet-600 hover:bg-violet-50 border border-transparent hover:border-violet-100 transition-all"
                                                    >
                                                        <TrendingUp className="h-3 w-3" />Réappro
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-violet-600 transition-all border border-transparent hover:border-violet-100"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ─── Modal Créer / Modifier ─────────────────────────────────── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
                        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-800">
                                {editingItem ? "Modifier l'article" : "Nouvel article"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-7 space-y-5">
                            {/* Catégorie */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Catégorie</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(c => {
                                        const Icon = c.icon;
                                        const colors = catColors(c.key);
                                        const isActive = form.categorie === c.key;
                                        return (
                                            <button
                                                key={c.key}
                                                type="button"
                                                onClick={() => { setForm(f => ({ ...f, categorie: c.key, nom: "" })); setShowSuggestions(false); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                    isActive ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm` : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100"
                                                }`}
                                            >
                                                <Icon className="h-3 w-3" />{c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Nom + suggestions */}
                            <div className="relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nom de l'article</label>
                                <input
                                    type="text"
                                    value={form.nom}
                                    onChange={e => { setForm(f => ({ ...f, nom: e.target.value })); setShowSuggestions(e.target.value === ""); }}
                                    onFocus={() => setShowSuggestions(!form.nom)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    placeholder="Ex: Gel échographie 250ml"
                                />
                                {showSuggestions && (SUGGESTIONS[form.categorie]?.length ?? 0) > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden">
                                        <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                            Articles fréquents — {form.categorie}
                                        </p>
                                        {SUGGESTIONS[form.categorie].map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseDown={() => { setForm(f => ({ ...f, nom: s })); setShowSuggestions(false); }}
                                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Quantité + unité */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quantité</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.quantite}
                                        onChange={e => setForm(f => ({ ...f, quantite: parseInt(e.target.value) || 0 }))}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Unité</label>
                                    <select
                                        value={form.unite}
                                        onChange={e => setForm(f => ({ ...f, unite: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none"
                                    >
                                        {UNITES.map(u => <option key={u} value={u}>{UNITE_LABELS[u]}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Seuil alerte */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Seuil d'alerte</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.seuilAlerte}
                                    onChange={e => setForm(f => ({ ...f, seuilAlerte: parseInt(e.target.value) || 0 }))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Alerte "Stock bas" à 2× ce seuil, "Critique" en dessous.</p>
                            </div>
                        </div>

                        <div className="px-7 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-violet-100 transition-all flex items-center justify-center gap-2"
                            >
                                {editingItem ? "Sauvegarder" : "Créer l'article"}
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Modal Réapprovisionnement ──────────────────────────────── */}
            {isRestockOpen && restockItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsRestockOpen(false)} />
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden">
                        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">Réapprovisionnement</h2>
                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{restockItem.nom}</p>
                            </div>
                            <button onClick={() => setIsRestockOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-7 space-y-5">
                            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                                <span className="text-sm text-slate-500">Stock actuel</span>
                                <span className="font-black text-slate-900">{restockItem.quantite} {UNITE_LABELS[restockItem.unite] ?? restockItem.unite}</span>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                                    Quantité à ajouter
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setRestockQty(q => Math.max(1, q - 5))}
                                        className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold text-sm"
                                    >-5</button>
                                    <input
                                        type="number"
                                        min={1}
                                        value={restockQty}
                                        onChange={e => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="flex-1 text-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-lg font-black focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                    />
                                    <button
                                        onClick={() => setRestockQty(q => q + 5)}
                                        className="h-10 w-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors font-bold text-sm"
                                    >+5</button>
                                </div>
                                <p className="text-xs text-slate-400 text-center mt-2">
                                    Nouveau stock: <span className="font-black text-emerald-600">{restockItem.quantite + restockQty}</span> {UNITE_LABELS[restockItem.unite] ?? restockItem.unite}
                                </p>
                            </div>
                        </div>
                        <div className="px-7 py-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button onClick={() => setIsRestockOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                Annuler
                            </button>
                            <button
                                onClick={handleRestock}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                            >
                                <TrendingUp className="h-4 w-4" />
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
