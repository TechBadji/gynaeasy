"use client";

import { useState, useTransition, useMemo } from "react";
import { createAdvertisement, updateAdvertisement, deleteAdvertisement } from "@/app/actions/superadmin";
import {
    Plus, Trash2, Calendar, CheckCircle2, PauseCircle, StopCircle,
    Link as LinkIcon, Image as ImageIcon, MousePointerClick, Eye,
    TrendingUp, Pencil, Search, ExternalLink, Palette
} from "lucide-react";
import toast from "react-hot-toast";

const PLANS = ["SOLO", "PRO", "CLINIQUE"] as const;
const PLAN_COLORS: Record<string, string> = {
    SOLO:     "bg-slate-500/20 text-slate-300 border-slate-500/30",
    PRO:      "bg-violet-500/20 text-violet-300 border-violet-500/30",
    CLINIQUE: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

const GRADIENT_OPTIONS = [
    { label: "Violet",    value: "from-violet-600 to-indigo-700",   preview: "bg-gradient-to-br from-violet-600 to-indigo-700" },
    { label: "Rose",      value: "from-pink-600 to-rose-700",       preview: "bg-gradient-to-br from-pink-600 to-rose-700" },
    { label: "Teal",      value: "from-teal-600 to-cyan-700",       preview: "bg-gradient-to-br from-teal-600 to-cyan-700" },
    { label: "Ambre",     value: "from-amber-500 to-orange-600",    preview: "bg-gradient-to-br from-amber-500 to-orange-600" },
    { label: "Ardoise",   value: "from-slate-700 to-slate-900",     preview: "bg-gradient-to-br from-slate-700 to-slate-900" },
    { label: "Emeraude",  value: "from-emerald-600 to-green-700",   preview: "bg-gradient-to-br from-emerald-600 to-green-700" },
];

type Ad = {
    id: string;
    partenaire: string;
    titre: string;
    description: string | null;
    imageUrl: string | null;
    lienClick: string | null;
    couleur: string | null;
    formatCible: string[];
    dateDebut: string;
    dateFin: string;
    prixParJour: number;
    prixTotal: number;
    statut: "ACTIF" | "PAUSE";
    clickCount: number;
    impressionCount: number;
    createdAt: string;
};

function adStatus(ad: Ad): "ACTIF" | "PAUSE" | "TERMINE" | "A_VENIR" {
    const now = new Date();
    const start = new Date(ad.dateDebut);
    const end = new Date(ad.dateFin);
    if (ad.statut === "PAUSE") return "PAUSE";
    if (now > end) return "TERMINE";
    if (now < start) return "A_VENIR";
    return "ACTIF";
}

function StatusBadge({ ad }: { ad: Ad }) {
    const s = adStatus(ad);
    const cfg: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
        ACTIF:    { label: "En cours",  cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
        PAUSE:    { label: "En pause",  cls: "bg-amber-500/10 text-amber-400 border-amber-500/30",       icon: PauseCircle },
        TERMINE:  { label: "Terminée",  cls: "bg-slate-500/10 text-slate-500 border-slate-500/30",       icon: StopCircle },
        A_VENIR:  { label: "À venir",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/30",          icon: Calendar },
    };
    const { label, cls, icon: Icon } = cfg[s];
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
            <Icon className="h-2.5 w-2.5" /> {label}
        </span>
    );
}

function PlanChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const toggle = (p: string) => onChange(value.includes(p) ? value.filter(x => x !== p) : [...value, p]);
    return (
        <div className="flex gap-2 flex-wrap">
            {PLANS.map(p => (
                <button key={p} type="button" onClick={() => toggle(p)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${value.includes(p) ? PLAN_COLORS[p] : "bg-white/3 text-slate-600 border-white/5 hover:border-white/20"}`}>
                    {p}
                </button>
            ))}
            {value.length > 0 && (
                <button type="button" onClick={() => onChange([])} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
                    Tous les plans
                </button>
            )}
        </div>
    );
}

function AdPreview({ titre, description, partenaire, imageUrl, couleur }: {
    titre: string; description: string; partenaire: string; imageUrl: string; couleur: string;
}) {
    const gradient = couleur || "from-violet-600 to-indigo-700";
    return (
        <div className={`rounded-2xl p-6 text-white relative overflow-hidden bg-gradient-to-br ${gradient} shadow-xl flex flex-col items-center text-center space-y-3`}>
            {imageUrl && (
                <div className="absolute inset-0 opacity-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
            )}
            <div className="relative z-10 space-y-2">
                {partenaire && (
                    <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Partenaire : {partenaire}
                    </span>
                )}
                <h3 className="text-lg font-bold">{titre || "Titre de la campagne"}</h3>
                <p className="text-white/80 text-xs max-w-xs">{description || "Description de votre encart publicitaire"}</p>
                <div className="pt-1">
                    <span className="inline-block bg-white text-indigo-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow">
                        Découvrir l&apos;offre
                    </span>
                </div>
            </div>
        </div>
    );
}

const emptyForm = () => ({
    partenaire: "",
    titre: "",
    description: "",
    imageUrl: "",
    lienClick: "",
    couleur: "from-violet-600 to-indigo-700",
    formatCible: [] as string[],
    dateDebut: "",
    dateFin: "",
    prixParJour: 0,
});

function AdForm({
    initial,
    onSubmit,
    onCancel,
    isPending,
    submitLabel,
}: {
    initial: ReturnType<typeof emptyForm>;
    onSubmit: (data: ReturnType<typeof emptyForm>) => void;
    onCancel: () => void;
    isPending: boolean;
    submitLabel: string;
}) {
    const [form, setForm] = useState(initial);
    const set = (k: keyof typeof form, v: any) => setForm(prev => ({ ...prev, [k]: v }));
    const [showPreview, setShowPreview] = useState(false);

    const days = form.dateDebut && form.dateFin
        ? Math.ceil(Math.abs(new Date(form.dateFin).getTime() - new Date(form.dateDebut).getTime()) / 86400000) + 1
        : 0;
    const total = days * form.prixParJour;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{submitLabel === "Créer" ? "Nouvelle campagne" : "Modifier la campagne"}</h3>
                <button
                    type="button"
                    onClick={() => setShowPreview(p => !p)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 transition-colors"
                >
                    <Eye className="h-3 w-3" /> {showPreview ? "Masquer l'aperçu" : "Aperçu"}
                </button>
            </div>

            {showPreview && (
                <AdPreview
                    titre={form.titre}
                    description={form.description}
                    partenaire={form.partenaire}
                    imageUrl={form.imageUrl}
                    couleur={form.couleur}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Partenaire *</label>
                    <input type="text" value={form.partenaire} onChange={e => set("partenaire", e.target.value)}
                        placeholder="Sanofi, Orange, Laabo…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Titre *</label>
                    <input type="text" value={form.titre} onChange={e => set("titre", e.target.value)}
                        placeholder="Découvrez notre nouvelle gamme…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div className="md:col-span-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Description</label>
                    <input type="text" value={form.description} onChange={e => set("description", e.target.value)}
                        placeholder="Sous-titre ou accroche de l'encart"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> Image de fond (URL)
                    </label>
                    <input type="text" value={form.imageUrl} onChange={e => set("imageUrl", e.target.value)}
                        placeholder="https://…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" /> Lien au clic
                    </label>
                    <input type="text" value={form.lienClick} onChange={e => set("lienClick", e.target.value)}
                        placeholder="https://…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>

                {/* Couleur */}
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Palette className="h-3 w-3" /> Couleur de l&apos;encart
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {GRADIENT_OPTIONS.map(g => (
                            <button key={g.value} type="button" onClick={() => set("couleur", g.value)}
                                title={g.label}
                                className={`h-7 w-7 rounded-full ${g.preview} transition-all ${form.couleur === g.value ? "ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110" : "opacity-60 hover:opacity-100"}`} />
                        ))}
                    </div>
                </div>

                {/* Ciblage plan */}
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                        Plans ciblés <span className="text-slate-600 normal-case font-normal">(vide = tous)</span>
                    </label>
                    <PlanChips value={form.formatCible} onChange={v => set("formatCible", v)} />
                </div>

                {/* Dates */}
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Date de début *</label>
                    <input type="date" value={form.dateDebut} onChange={e => set("dateDebut", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Date de fin *</label>
                    <input type="date" value={form.dateFin} onChange={e => set("dateFin", e.target.value)}
                        min={form.dateDebut}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Prix / jour (FCFA) *</label>
                    <input type="number" min={0} value={form.prixParJour || ""} onChange={e => set("prixParJour", parseFloat(e.target.value) || 0)}
                        placeholder="5000"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                {/* Récap financier */}
                {days > 0 && form.prixParJour > 0 && (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                        <TrendingUp className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-emerald-300 font-bold">
                                {days} jour{days > 1 ? "s" : ""} × {form.prixParJour.toLocaleString("fr-FR")} FCFA
                            </p>
                            <p className="text-lg font-black text-white leading-tight">
                                {total.toLocaleString("fr-FR")} FCFA
                                <span className="text-xs font-normal text-slate-400 ml-1">total partenaire</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <button onClick={onCancel} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">Annuler</button>
                <button
                    onClick={() => onSubmit(form)}
                    disabled={isPending || !form.partenaire || !form.titre || !form.dateDebut || !form.dateFin || form.prixParJour <= 0}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold px-6 py-2 rounded-lg transition-all"
                >
                    {isPending ? "En cours…" : submitLabel}
                </button>
            </div>
        </div>
    );
}

export default function SuperAdminAdvertisements({ advertisements }: { advertisements: any[] }) {
    const [list, setList] = useState<Ad[]>(advertisements);
    const [isPending, startTransition] = useTransition();
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "ACTIF" | "PAUSE" | "TERMINE" | "A_VENIR">("all");

    const filtered = useMemo(() => {
        return list
            .filter(ad => ad.titre.toLowerCase().includes(search.toLowerCase()) || ad.partenaire.toLowerCase().includes(search.toLowerCase()))
            .filter(ad => filter === "all" || adStatus(ad) === filter);
    }, [list, search, filter]);

    const stats = useMemo(() => {
        const now = new Date();
        return {
            totalRevenu: list.reduce((s, a) => s + a.prixTotal, 0),
            totalClicks: list.reduce((s, a) => s + a.clickCount, 0),
            totalImpressions: list.reduce((s, a) => s + a.impressionCount, 0),
            active: list.filter(a => adStatus(a) === "ACTIF").length,
            avgCTR: (() => {
                const total = list.reduce((s, a) => s + a.impressionCount, 0);
                const clicks = list.reduce((s, a) => s + a.clickCount, 0);
                return total > 0 ? ((clicks / total) * 100).toFixed(1) : "0.0";
            })(),
        };
    }, [list]);

    const handleCreate = (form: ReturnType<typeof emptyForm>) => {
        startTransition(async () => {
            try {
                const created = await createAdvertisement({
                    ...form,
                    dateDebut: new Date(form.dateDebut),
                    dateFin: new Date(form.dateFin),
                });
                setList(prev => [created, ...prev]);
                setCreating(false);
                toast.success("Campagne créée");
            } catch {
                toast.error("Erreur de création");
            }
        });
    };

    const handleUpdate = (ad: Ad, form: ReturnType<typeof emptyForm>) => {
        startTransition(async () => {
            try {
                const updated = await updateAdvertisement(ad.id, {
                    partenaire: form.partenaire,
                    titre: form.titre,
                    description: form.description || null,
                    imageUrl: form.imageUrl || null,
                    lienClick: form.lienClick || null,
                    couleur: form.couleur || null,
                    formatCible: form.formatCible,
                    dateDebut: new Date(form.dateDebut),
                    dateFin: new Date(form.dateFin),
                    prixParJour: form.prixParJour,
                });
                setList(prev => prev.map(a => a.id === ad.id ? { ...a, ...updated } : a));
                setEditingId(null);
                toast.success("Campagne mise à jour");
            } catch {
                toast.error("Erreur de modification");
            }
        });
    };

    const handleToggleStatus = (ad: Ad) => {
        const newStatus = ad.statut === "ACTIF" ? "PAUSE" : "ACTIF";
        startTransition(async () => {
            try {
                const updated = await updateAdvertisement(ad.id, { statut: newStatus });
                setList(prev => prev.map(a => a.id === ad.id ? { ...a, ...updated } : a));
                toast.success(newStatus === "PAUSE" ? "Campagne mise en pause" : "Campagne réactivée");
            } catch { toast.error("Erreur"); }
        });
    };

    const handleDelete = (id: string, titre: string) => {
        if (!confirm(`Supprimer la campagne "${titre}" ?`)) return;
        startTransition(async () => {
            try {
                await deleteAdvertisement(id);
                setList(prev => prev.filter(a => a.id !== id));
                toast.success("Campagne supprimée");
            } catch { toast.error("Erreur"); }
        });
    };

    const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Campagnes Publicitaires</h1>
                    <p className="text-slate-400 text-sm mt-1">Gérez les encarts partenaires affichés aux médecins, suivez les performances</p>
                </div>
                <button onClick={() => { setCreating(true); setEditingId(null); }}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-violet-500/20">
                    <Plus className="h-4 w-4" /> Nouvelle Campagne
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Revenus totaux",  value: `${fmt(stats.totalRevenu)} FCFA`, icon: TrendingUp,        color: "text-emerald-400" },
                    { label: "Impressions",     value: fmt(stats.totalImpressions),       icon: Eye,               color: "text-blue-400" },
                    { label: "Clics totaux",    value: fmt(stats.totalClicks),            icon: MousePointerClick, color: "text-pink-400" },
                    { label: "CTR moyen",       value: `${stats.avgCTR}%`,               icon: TrendingUp,        color: "text-violet-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-lg bg-white/5 flex items-center justify-center ${color} flex-shrink-0`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-base font-black text-white truncate">{value}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Formulaire de création */}
            {creating && (
                <AdForm
                    initial={emptyForm()}
                    onSubmit={handleCreate}
                    onCancel={() => setCreating(false)}
                    isPending={isPending}
                    submitLabel="Créer"
                />
            )}

            {/* Recherche + filtres */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher une campagne ou un partenaire…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-1 flex-shrink-0">
                    {(["all", "ACTIF", "A_VENIR", "PAUSE", "TERMINE"] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${filter === f ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}>
                            {f === "all" ? "Tous" : f === "ACTIF" ? "En cours" : f === "A_VENIR" ? "À venir" : f === "PAUSE" ? "En pause" : "Terminées"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste des campagnes */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-12 text-center text-slate-500 italic text-sm">
                        {search || filter !== "all" ? "Aucune campagne ne correspond" : "Aucune campagne créée"}
                    </div>
                ) : filtered.map(ad => {
                    const gradient = ad.couleur || "from-violet-600 to-indigo-700";
                    const status = adStatus(ad);
                    const ctr = ad.impressionCount > 0 ? ((ad.clickCount / ad.impressionCount) * 100).toFixed(1) : "—";
                    const isEditing = editingId === ad.id;
                    const daysLeft = Math.ceil((new Date(ad.dateFin).getTime() - Date.now()) / 86400000);

                    return (
                        <div key={ad.id} className={`bg-white/5 border rounded-xl overflow-hidden transition-all ${isEditing ? "border-violet-500/40" : "border-white/10"}`}>
                            {/* Ligne principale */}
                            <div className="flex items-start gap-4 p-4">
                                {/* Mini preview couleur */}
                                <div className={`flex-shrink-0 h-14 w-20 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white/50 text-[10px] font-bold relative overflow-hidden`}>
                                    {ad.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={ad.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
                                    ) : null}
                                    <span className="relative z-10 text-[8px] uppercase tracking-wider text-white/70">Aperçu</span>
                                </div>

                                {/* Info campagne */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">{ad.partenaire}</span>
                                                <StatusBadge ad={ad} />
                                                {ad.formatCible.length > 0 && ad.formatCible.map(p => (
                                                    <span key={p} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${PLAN_COLORS[p] ?? ""}`}>{p}</span>
                                                ))}
                                            </div>
                                            <p className="font-bold text-white mt-1 text-sm truncate">{ad.titre}</p>
                                            {ad.description && <p className="text-[11px] text-slate-500 truncate">{ad.description}</p>}
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {ad.lienClick && (
                                                <a href={ad.lienClick} target="_blank" rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-white/5 transition-all" title="Ouvrir le lien">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                            <button onClick={() => setEditingId(isEditing ? null : ad.id)}
                                                className={`p-1.5 rounded-lg transition-all ${isEditing ? "bg-violet-600/20 text-violet-400" : "text-slate-500 hover:text-violet-400 hover:bg-white/5"}`} title="Modifier">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            {status !== "TERMINE" && (
                                                <button onClick={() => handleToggleStatus(ad)}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-white/5 transition-all"
                                                    title={ad.statut === "ACTIF" ? "Mettre en pause" : "Réactiver"}>
                                                    <PauseCircle className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(ad.id, ad.titre)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all" title="Supprimer">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Métriques en ligne */}
                                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(ad.dateDebut).toLocaleDateString("fr-FR")} → {new Date(ad.dateFin).toLocaleDateString("fr-FR")}
                                            {status === "ACTIF" && daysLeft > 0 && (
                                                <span className="text-blue-400 font-bold ml-1">({daysLeft}j restants)</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                                            <TrendingUp className="h-3 w-3" />
                                            {fmt(ad.prixTotal)} FCFA
                                            <span className="text-slate-600 font-normal">({fmt(ad.prixParJour)}/j)</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 ml-auto">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3 text-blue-400" />
                                                {fmt(ad.impressionCount)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MousePointerClick className="h-3 w-3 text-pink-400" />
                                                {fmt(ad.clickCount)}
                                            </span>
                                            <span className="font-mono font-bold text-violet-400">CTR {ctr}%</span>
                                        </div>
                                    </div>

                                    {/* Barre CTR */}
                                    {ad.impressionCount > 0 && (
                                        <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                                                style={{ width: `${Math.min(parseFloat(ctr as string), 20) * 5}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Formulaire d'édition inline */}
                            {isEditing && (
                                <div className="border-t border-white/10 p-4 bg-white/3">
                                    <AdForm
                                        initial={{
                                            partenaire:   ad.partenaire,
                                            titre:        ad.titre,
                                            description:  ad.description ?? "",
                                            imageUrl:     ad.imageUrl ?? "",
                                            lienClick:    ad.lienClick ?? "",
                                            couleur:      ad.couleur ?? "from-violet-600 to-indigo-700",
                                            formatCible:  ad.formatCible,
                                            dateDebut:    ad.dateDebut.slice(0, 10),
                                            dateFin:      ad.dateFin.slice(0, 10),
                                            prixParJour:  ad.prixParJour,
                                        }}
                                        onSubmit={(form) => handleUpdate(ad, form)}
                                        onCancel={() => setEditingId(null)}
                                        isPending={isPending}
                                        submitLabel="Enregistrer"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
