import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getClinicSettings } from "@/app/actions/clinic";
import ClinicSettingsForm from "@/components/settings/clinic-settings-form";
import PasswordChangeForm from "@/components/settings/password-change-form";
import { Settings } from "lucide-react";

export default async function ParametresPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/api/auth/signin");

    const [settings, user] = await Promise.all([
        getClinicSettings(),
        prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, clinicName: true, specialite: true }
        })
    ]);

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-indigo-600" />
                    Paramètres du Cabinet
                </h1>
                <p className="text-slate-500 text-sm">Configurez l'identité visuelle de votre cabinet et sécurisez votre accès.</p>
            </div>

            <div className="pt-4 grid grid-cols-1 gap-12">
                <ClinicSettingsForm 
                    initialSettings={settings} 
                    userSettings={{ 
                        id: user?.id || "", 
                        clinicName: user?.clinicName || "",
                        name: user?.name || "",
                        specialite: user?.specialite || ""
                    }} 
                />
                
                <PasswordChangeForm />
            </div>
        </div>
    );
}
