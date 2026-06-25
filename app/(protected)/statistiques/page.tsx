import { getStatisticsData } from "@/app/actions/statistics";
import StatisticsClient from "./statistics-client";
import { BarChart2 } from "lucide-react";

export const metadata = { title: "Statistiques & Analyse — Gynaeasy" };
export const dynamic = "force-dynamic";

export default async function StatistiquesPage() {
    const data = await getStatisticsData();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <BarChart2 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Statistiques & Analyse</h1>
                    <p className="text-sm text-slate-500">Activité médicale — 6 derniers mois</p>
                </div>
            </div>

            <StatisticsClient data={data} />
        </div>
    );
}
