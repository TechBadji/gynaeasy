import Link from "next/link";
import { differenceInDays } from "date-fns";
import { Heart } from "lucide-react";

export default function GrossessesProches({ grossesses }: { grossesses: any[] }) {
    if (grossesses.length === 0) return null;

    const now = new Date();

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <h3 className="text-sm font-black text-slate-900">Termes proches</h3>
                </div>
                <span className="text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                    {grossesses.length} DPA &lt; 30j
                </span>
            </div>
            <div className="p-3 space-y-1">
                {grossesses.map((g: any) => {
                    const dpa = g.dpa ? new Date(g.dpa) : null;
                    const daysLeft = dpa ? differenceInDays(dpa, now) : null;
                    const urgencyConfig =
                        daysLeft === null     ? { badge: "bg-slate-100 text-slate-500",  bar: "bg-slate-300" } :
                        daysLeft <= 7         ? { badge: "bg-red-50 text-red-600 border border-red-100", bar: "bg-red-500" } :
                        daysLeft <= 14        ? { badge: "bg-amber-50 text-amber-600 border border-amber-100", bar: "bg-amber-500" } :
                                                { badge: "bg-blue-50 text-blue-600 border border-blue-100", bar: "bg-blue-400" };

                    return (
                        <Link key={g.id} href={`/patients/${g.patient.id}`}>
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {g.patient.nom.toUpperCase()} {g.patient.prenom}
                                    </p>
                                    {dpa && (
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            DPA : {dpa.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                                        </p>
                                    )}
                                </div>
                                {daysLeft !== null && (
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ml-3 flex-shrink-0 ${urgencyConfig.badge}`}>
                                        J-{daysLeft}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
