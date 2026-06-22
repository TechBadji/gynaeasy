import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Activity, Shield, ShieldCheck } from "lucide-react";
import Setup2FAForm from "./setup-2fa-form";

export default async function Setup2FAPage() {
    const session = await getServerSession(authOptions);

    if (!session) redirect("/auth/login");

    // Si la 2FA n'est pas requise ou déjà activée → dashboard
    if (!(session.user as any)?.twoFactorSetupRequired) {
        redirect("/dashboard");
    }

    const user = await (prisma.user as any).findUnique({
        where: { id: (session.user as any).id },
        select: { twoFactorEnabled: true, twoFactorRequired: true },
    });

    if (user?.twoFactorEnabled) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="h-16 w-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 group hover:scale-110 transition-transform">
                        <Activity className="h-8 w-8 text-pink-600 transition-transform group-hover:rotate-12" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gynaeasy</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Espace professionnel médical sécurisé</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldCheck className="h-32 w-32" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-1.5 rounded-full border border-pink-100 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Shield className="h-3.5 w-3.5" />
                            Sécurité requise
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">Activez la double authentification</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                            L'administrateur exige que vous protégiez votre compte avec une application d'authentification (Google Authenticator, Authy, 1Password…).
                        </p>

                        <Setup2FAForm />
                    </div>
                </div>

                <p className="text-center text-slate-400 text-[10px] font-bold mt-10 uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} Gynaeasy &bull; Tous droits réservés
                </p>
            </div>
        </div>
    );
}
