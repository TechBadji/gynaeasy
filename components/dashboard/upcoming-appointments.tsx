import { prisma } from "@/lib/prisma";
import { Globe, Phone, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default async function UpcomingAppointments({ doctorId }: { doctorId?: string }) {
    const appointments = await prisma.consultation.findMany({
        where: {
            userId: doctorId || undefined,
            dateHeure: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
            }
        },
        include: {
            patient: true
        },
        orderBy: { dateHeure: "asc" }
    });

    if (appointments.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 italic text-sm">
                Aucun rendez-vous aujourd'hui.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {appointments.map((apt: any) => (
                <div key={apt.id} className="group flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-white hover:border-violet-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl h-12 w-14 border border-slate-100">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">{format(apt.dateHeure, "HH:mm")}</span>
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                {apt.patient.nom.toUpperCase()} {apt.patient.prenom}
                                {apt.source === "ONLINE" ? (
                                    <span title="RDV en ligne"><Globe className="h-3 w-3 text-blue-500" /></span>
                                ) : (
                                    <span title="RDV par téléphone"><Phone className="h-3 w-3 text-amber-500" /></span>
                                )}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 uppercase tracking-wider font-semibold">
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                {apt.type.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${apt.source === "ONLINE" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                            {apt.source === "ONLINE" ? "WEB" : "TEL"}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
