"use client";

import { Shield, User, FileText, AlertTriangle, CheckCircle, Info } from "lucide-react";

const ACTION_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
    CONNEXION: { icon: User, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    CONNEXION_ECHOUEE: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
    CONSULTATION_DOSSIER: { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
    MODIFICATION_ORDONNANCE: { icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
    FACTURATION: { icon: CheckCircle, color: "text-violet-400", bg: "bg-violet-500/10" },
    DEFAULT: { icon: Info, color: "text-slate-400", bg: "bg-slate-500/10" },
};

function getActionConfig(action: string) {
    for (const key of Object.keys(ACTION_CONFIG)) {
        if (action?.includes(key)) return ACTION_CONFIG[key];
    }
    return ACTION_CONFIG.DEFAULT;
}

function timeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
    return `il y a ${Math.floor(diff / 86400)}j`;
}

export default function SuperAdminAudit({ logs }: { logs: any[] }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Journal d&apos;Audit</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Traçabilité complète des actions — conformité HDS
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total événements", value: logs.length, color: "text-white" },
                    {
                        label: "Connexions échouées",
                        value: logs.filter((l) => l.action?.includes("ECHOUEE")).length,
                        color: "text-red-400",
                    },
                    {
                        label: "Modifications dossier",
                        value: logs.filter((l) => l.action?.includes("CONSULTATION") || l.action?.includes("ORDONNANCE")).length,
                        color: "text-blue-400",
                    },
                    {
                        label: "Facturations",
                        value: logs.filter((l) => l.action?.includes("FACTURATION")).length,
                        color: "text-violet-400",
                    },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center gap-2 p-5 border-b border-white/5">
                    <Shield className="h-4 w-4 text-violet-400" />
                    <span className="text-sm font-semibold text-white">Événements récents</span>
                    <span className="text-xs text-slate-500 ml-auto">30 derniers enregistrements</span>
                </div>

                {logs.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {logs.map((log, idx) => {
                            const config = getActionConfig(log.action || "");
                            const Icon = config.icon;
                            let parsedDetails: any = null;
                            try {
                                if (log.details) parsedDetails = JSON.parse(log.details);
                            } catch { }

                            return (
                                <div key={log.id || idx} className="flex gap-4 p-4 hover:bg-white/3 transition-colors">
                                    <div className={`flex-shrink-0 h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center mt-0.5`}>
                                        <Icon className={`h-4 w-4 ${config.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className={`text-sm font-semibold ${config.color}`}>
                                                    {log.action || "ACTION_INCONNUE"}
                                                </span>
                                                {log.patientId && (
                                                    <span className="ml-2 text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                                                        Patient
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                                                {timeAgo(log.timestamp)}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                                            <span className="font-mono text-slate-500">{log.userId?.slice(0, 12)}…</span>
                                            {log.ipAddress && (
                                                <span className="bg-white/5 px-1.5 py-0.5 rounded font-mono">{log.ipAddress}</span>
                                            )}
                                        </div>
                                        {parsedDetails && (
                                            <div className="mt-2 bg-white/5 rounded-lg p-2 text-xs text-slate-400 font-mono">
                                                {JSON.stringify(parsedDetails, null, 2)}
                                            </div>
                                        )}
                                        {log.details && !parsedDetails && (
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{log.details}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <Shield className="h-12 w-12 mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-500 font-medium">Aucun événement dans le journal</p>
                        <p className="text-xs text-slate-600 mt-1">Les actions des utilisateurs apparaîtront ici</p>
                    </div>
                )}
            </div>
        </div>
    );
}
