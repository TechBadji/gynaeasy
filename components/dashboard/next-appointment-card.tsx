import Link from "next/link";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, CalendarCheck, Video, Phone, Globe } from "lucide-react";

const TYPE_CONFIG: Record<string, { label: string; badge: string }> = {
    CONSULTATION:     { label: "Consultation",    badge: "bg-white/20 text-white" },
    ECHOGRAPHIE:      { label: "Échographie",     badge: "bg-white/20 text-white" },
    URGENCE:          { label: "Urgence 🚨",      badge: "bg-red-400/40 text-white" },
    SUIVI_GROSSESSE:  { label: "Suivi grossesse", badge: "bg-white/20 text-white" },
    TELECONSULTATION: { label: "Téléconsult.",    badge: "bg-white/20 text-white" },
};

const SOURCE_ICON: Record<string, typeof Phone> = {
    ONLINE: Globe,
    PHONE: Phone,
};

export default function NextAppointmentCard({ prochainRDV }: { prochainRDV: any }) {
    if (!prochainRDV) {
        return (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-8 text-center">
                <CalendarCheck className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Aucun prochain rendez-vous</p>
                <p className="text-xs text-slate-400 mt-1">Votre agenda est libre pour la suite de la journée</p>
                <Link href="/agenda?new=true"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">
                    Programmer un RDV <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        );
    }

    const rdvDate = new Date(prochainRDV.dateHeure);
    const now = new Date();
    const minutesUntil = differenceInMinutes(rdvDate, now);
    const hoursUntil = differenceInHours(rdvDate, now);

    let countdown = "";
    let urgency: "now" | "soon" | "later" = "later";
    if (minutesUntil < 0) { countdown = "En cours"; urgency = "now"; }
    else if (minutesUntil < 15) { countdown = `Dans ${minutesUntil} min`; urgency = "soon"; }
    else if (minutesUntil < 60) { countdown = `Dans ${minutesUntil} min`; urgency = "soon"; }
    else if (hoursUntil < 3) {
        const rem = minutesUntil % 60;
        countdown = `Dans ${hoursUntil}h${rem > 0 ? rem + "min" : ""}`;
    } else {
        countdown = format(rdvDate, "HH:mm", { locale: fr });
    }

    const typeConf = TYPE_CONFIG[prochainRDV.type] ?? { label: prochainRDV.type, badge: "bg-white/20 text-white" };
    const patient = prochainRDV.patient;
    const SourceIcon = SOURCE_ICON[prochainRDV.source] ?? Phone;

    return (
        <Link href={`/patients/${patient.id}`}>
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-violet-100/80 hover:shadow-xl hover:shadow-violet-200 transition-all cursor-pointer group relative overflow-hidden">
                {/* Décoration */}
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <p className="text-violet-200 text-[11px] font-black uppercase tracking-widest mb-1.5">
                                Prochain patient
                            </p>
                            <h2 className="text-2xl font-black leading-tight">
                                {patient.nom.toUpperCase()} {patient.prenom}
                            </h2>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                            <p className={`text-xl font-black ${urgency === "now" ? "text-emerald-300" : urgency === "soon" ? "text-amber-300" : "text-white"}`}>
                                {countdown}
                            </p>
                            <p className="text-violet-300 text-xs mt-0.5">
                                {format(rdvDate, "HH:mm")} · {format(rdvDate, "d MMM", { locale: fr })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${typeConf.badge}`}>
                                {typeConf.label}
                            </span>
                            <span className="flex items-center gap-1 text-violet-300 text-xs">
                                <SourceIcon className="h-3 w-3" />
                                {prochainRDV.source === "ONLINE" ? "En ligne" : "Téléphone"}
                            </span>
                            {prochainRDV.motif && (
                                <span className="text-violet-200 text-xs italic truncate max-w-[160px]">
                                    {prochainRDV.motif}
                                </span>
                            )}
                        </div>
                        <span className="flex items-center gap-1 text-violet-200 text-xs font-bold group-hover:text-white transition-colors flex-shrink-0 ml-2">
                            Dossier <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
