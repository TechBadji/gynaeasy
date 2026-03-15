import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClinicSettings } from "@/app/actions/clinic";
import ClinicSettingsForm from "@/components/settings/clinic-settings-form";
import { Settings } from "lucide-react";

export default async function ParametresPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    const settings = await getClinicSettings();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-indigo-600" />
                    Paramètres du Cabinet
                </h1>
                <p className="text-slate-500 text-sm">Configurez l'identité visuelle et les coordonnées de votre cabinet médical.</p>
            </div>

            <div className="pt-4">
                <ClinicSettingsForm initialSettings={settings} />
            </div>
        </div>
    );
}
