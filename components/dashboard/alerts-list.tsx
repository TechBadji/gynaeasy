"use client";

import { useState, useTransition } from "react";
import { markAsRead, markAllAsRead } from "@/app/actions/notifications";
import {
    Bell, Info, CheckCircle2, AlertTriangle, AlertCircle,
    CheckCheck, ExternalLink, BellOff, X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TYPE_CONFIG: Record<string, { icon: typeof Bell; iconBg: string; iconColor: string; border: string }> = {
    INFO:    { icon: Info,         iconBg: "bg-blue-100",    iconColor: "text-blue-600",    border: "border-blue-50" },
    SUCCESS: { icon: CheckCircle2, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", border: "border-emerald-50" },
    WARNING: { icon: AlertTriangle,iconBg: "bg-amber-100",   iconColor: "text-amber-600",   border: "border-amber-50" },
    ERROR:   { icon: AlertCircle,  iconBg: "bg-red-100",     iconColor: "text-red-600",     border: "border-red-50" },
    URGENT:  { icon: AlertCircle,  iconBg: "bg-red-100",     iconColor: "text-red-600",     border: "border-red-50" },
};

interface Alert {
    id: string;
    titre: string;
    message: string;
    type: string;
    link: string | null;
    createdAt: string;
}

export default function AlertsList({ initialAlerts, unreadCount }: {
    initialAlerts: Alert[];
    unreadCount: number;
}) {
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleMarkOne = (id: string) => {
        startTransition(async () => {
            await markAsRead(id);
            setAlerts(prev => prev.filter(a => a.id !== id));
            router.refresh();
        });
    };

    const handleMarkAll = () => {
        startTransition(async () => {
            await markAllAsRead();
            setAlerts([]);
            router.refresh();
        });
    };

    return (
        <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-black text-slate-900">Alertes & Suivi</h3>
                    {alerts.length > 0 && (
                        <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                            {alerts.length}
                        </span>
                    )}
                </div>
                {alerts.length > 0 && (
                    <button
                        onClick={handleMarkAll}
                        disabled={isPending}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-violet-600 transition-colors"
                        title="Tout marquer comme lu"
                    >
                        <CheckCheck className="h-3.5 w-3.5" /> Tout lu
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-3 space-y-1.5 max-h-[320px] overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <BellOff className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs font-medium text-slate-400">Aucune alerte en attente</p>
                    </div>
                ) : alerts.map(alert => {
                    const conf = TYPE_CONFIG[alert.type] ?? TYPE_CONFIG.INFO;
                    const Icon = conf.icon;
                    const timeAgo = formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr });

                    return (
                        <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border ${conf.border} hover:shadow-sm transition-all group bg-white`}>
                            <div className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center ${conf.iconBg}`}>
                                <Icon className={`h-3.5 w-3.5 ${conf.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-bold text-slate-800 leading-tight">{alert.titre}</p>
                                    <button
                                        onClick={() => handleMarkOne(alert.id)}
                                        className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Marquer comme lu"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{alert.message}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[10px] text-slate-400">{timeAgo}</span>
                                    {alert.link && (
                                        <Link href={alert.link}
                                            className="text-[10px] font-bold text-violet-600 hover:text-violet-800 flex items-center gap-0.5 transition-colors">
                                            Voir <ExternalLink className="h-2.5 w-2.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
