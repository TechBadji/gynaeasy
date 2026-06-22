import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Globe, Phone, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

const TYPE_CONFIG: Record<string, { label: string; dot: string; timeBg: string; timeText: string }> = {
    CONSULTATION:     { label: "Consultation",    dot: "bg-violet-500", timeBg: "bg-violet-50",  timeText: "text-violet-700" },
    ECHOGRAPHIE:      { label: "Échographie",     dot: "bg-blue-500",   timeBg: "bg-blue-50",    timeText: "text-blue-700" },
    URGENCE:          { label: "Urgence",          dot: "bg-red-500",    timeBg: "bg-red-50",     timeText: "text-red-700" },
    SUIVI_GROSSESSE:  { label: "Suivi grossesse", dot: "bg-pink-500",   timeBg: "bg-pink-50",    timeText: "text-pink-700" },
    TELECONSULTATION: { label: "Téléconsult.",    dot: "bg-teal-500",   timeBg: "bg-teal-50",    timeText: "text-teal-700" },
};

export default async function UpcomingAppointments({ doctorId }: { doctorId?: string }) {
    const appointments = await prisma.consultation.findMany({
        where: {
            userId: doctorId ?? undefined,
            dateHeure: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt:  new Date(new Date().setHours(23, 59, 59, 999)),
            },
        },
        include: {
            patient: { select: { nom: true, prenom: true, id: true } },
            reglement: { select: { statut: true } },
        },
        orderBy: { dateHeure: "asc" },
    });

    if (appointments.length === 0) {
        return (
            <div className="text-center py-10 text-slate-300">
                <Clock className="h-10 w-10 mx-auto mb-3" />
                <p className="text-sm italic font-medium text-slate-400">Agenda libre pour le reste de la journée</p>
            </div>
        );
    }

    const now = new Date();

    return (
        <div className="space-y-1.5">
            {appointments.map((apt: any) => {
                const conf = TYPE_CONFIG[apt.type] ?? { label: apt.type, dot: "bg-slate-400", timeBg: "bg-slate-50", timeText: "text-slate-600" };
                const isPast = new Date(apt.dateHeure) < now;
                const regStatut = apt.reglement?.statut;

                return (
                    <Link key={apt.id} href={`/patients/${apt.patient.id}`}>
                        <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50/50 transition-all border border-transparent hover:border-violet-100 group ${isPast ? "opacity-55" : ""}`}>
                            {/* Heure colorée par type */}
                            <div className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl ${conf.timeBg}`}>
                                <span className={`text-sm font-black leading-none ${conf.timeText}`}>
                                    {format(new Date(apt.dateHeure), "HH")}
                                </span>
                                <span className={`text-xs font-bold opacity-70 ${conf.timeText}`}>
                                    {format(new Date(apt.dateHeure), "mm")}
                                </span>
                            </div>

                            {/* Infos patient + type */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 text-sm truncate">
                                        {apt.patient.nom.toUpperCase()} {apt.patient.prenom}
                                    </span>
                                    {apt.source === "ONLINE"
                                        ? <Globe className="h-3 w-3 text-blue-400 flex-shrink-0" />
                                        : <Phone className="h-3 w-3 text-slate-300 flex-shrink-0" />}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${conf.dot}`} />
                                    <span className="text-xs text-slate-500 font-medium">{conf.label}</span>
                                    {apt.motif && (
                                        <span className="text-xs text-slate-400 truncate">— {apt.motif}</span>
                                    )}
                                </div>
                            </div>

                            {/* Badge règlement */}
                            <div className="flex-shrink-0">
                                {regStatut === "PAYE" ? (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                        Réglé
                                    </span>
                                ) : regStatut === "EN_ATTENTE" ? (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                                        <CreditCard className="h-2.5 w-2.5" /> Att.
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                                        Non réglé
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
