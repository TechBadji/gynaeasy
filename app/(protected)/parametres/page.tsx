export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getClinicSettings } from "@/app/actions/clinic";
import ClinicSettingsForm from "@/components/settings/clinic-settings-form";
import PasswordChangeForm from "@/components/settings/password-change-form";
import TwoFactorForm from "@/components/settings/two-factor-form";
import { Settings, Lock, Building2 } from "lucide-react";

interface PageProps {
    searchParams: Promise<{ tab?: string; required?: string }>;
}

export default async function ParametresPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/api/auth/signin");

    const { tab: tabParam, required: requiredParam } = await searchParams;
    const tab = tabParam === "securite" ? "securite" : "cabinet";
    const isRequired = requiredParam === "true";

    const [settings, user] = await Promise.all([
        getClinicSettings(),
        (prisma.user as any).findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                clinicName: true,
                specialite: true,
                isEmergencyAvailable: true,
                twoFactorEnabled: true,
                twoFactorRequired: true,
            },
        }),
    ]);

    const tabs = [
        { id: "cabinet", label: "Cabinet & Profil", icon: Building2, href: "/parametres?tab=cabinet" },
        { id: "securite", label: "Sécurité", icon: Lock, href: "/parametres?tab=securite" },
    ];

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-violet-600" />
                    Paramètres du Cabinet
                </h1>
                <p className="text-slate-500 text-sm">Configurez l'identité de votre cabinet et sécurisez votre accès.</p>
            </div>

            {/* Onglets */}
            <div className="border-b border-slate-200">
                <nav className="flex gap-1 -mb-px">
                    {tabs.map((t) => {
                        const Icon = t.icon;
                        const isActive = tab === t.id;
                        return (
                            <a
                                key={t.id}
                                href={t.href}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    isActive
                                        ? "border-violet-600 text-violet-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {t.label}
                            </a>
                        );
                    })}
                </nav>
            </div>

            {/* Contenu */}
            <div className="pt-2 grid grid-cols-1 gap-12">
                {tab === "cabinet" && (
                    <>
                        <ClinicSettingsForm
                            initialSettings={settings}
                            userSettings={{
                                id: user?.id || "",
                                clinicName: user?.clinicName || "",
                                name: user?.name || "",
                                specialite: user?.specialite || "",
                                isEmergencyAvailable: user?.isEmergencyAvailable || false
                            }}
                        />
                        <PasswordChangeForm />
                    </>
                )}

                {tab === "securite" && (
                    <div className="space-y-8 max-w-2xl">
                        <TwoFactorForm
                            initialEnabled={user?.twoFactorEnabled ?? false}
                            required={isRequired || user?.twoFactorRequired}
                        />
                        <PasswordChangeForm />
                    </div>
                )}
            </div>
        </div>
    );
}
