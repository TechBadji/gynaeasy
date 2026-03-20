import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./change-password-form";
import { Shield, Lock, Activity, CheckCircle2 } from "lucide-react";

export default async function ChangePasswordPage() {
    const session = await getServerSession(authOptions);

    if (!session) redirect("/auth/login");

    // Si l'utilisateur n'en a pas besoin, on le redirige vers le dashboard
    if (!(session.user as any)?.mustChangePassword) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-lg">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="h-16 w-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 group hover:scale-110 transition-transform">
                        <Activity className="h-8 w-8 text-pink-600 transition-transform group-hover:rotate-12" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gynaeasy</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Espace professionnel médical sécurisé</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Lock className="h-32 w-32" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest mb-6">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Première Connexion
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">Sécurisez votre compte</h2>
                        <p className="text-slate-500 font-medium text-sm mb-10 leading-relaxed">
                            Par mesure de sécurité, nous exigeons que vous changiez le mot de passe provisoire reçu par mail lors de votre première connexion.
                        </p>

                        <ChangePasswordForm />

                        <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-400">
                           <div className="flex flex-col items-center gap-1">
                                <Shield className="h-5 w-5 text-violet-500/50" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Sécurité HDS</span>
                           </div>
                           <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                           <div className="flex flex-col items-center gap-1">
                                <Lock className="h-5 w-5 text-pink-500/50" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Cryptage AES-256</span>
                           </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-400 text-[10px] font-bold mt-10 uppercase tracking-[0.2em]">
                    &copy; {new Date().getFullYear()} Gynaeasy &bull; Tous droits réservés
                </p>
            </div>
        </div>
    );
}
