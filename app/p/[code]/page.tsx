import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Activity, ShieldCheck, Lock, Calendar } from "lucide-react";
import Link from "next/link";

export default async function PublicProfilePage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const patient = await prisma.patient.findUnique({
        where: { codePatient: code },
        select: {
            id: true,
            nom: true,
            prenom: true,
            isPublic: true,
            civilite: true,
            dateNaissance: true,
            codePatient: true,
            // Ne pas sélectionner de données sensibles si on veut être strict, 
            // ou les sélectionner uniquement si isPublic est vrai.
        }
    });

    if (!patient) return notFound();

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-900 to-slate-900">
            <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-lg">
                        <Activity className="h-10 w-10 text-white" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {patient.civilite} {patient.nom.toUpperCase()} {patient.prenom}
                        </h1>
                        <p className="text-violet-400 font-mono mt-1 font-bold">Code Patient: #{patient.codePatient}</p>
                    </div>

                    {!patient.isPublic ? (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl w-full space-y-4">
                            <div className="flex items-center gap-3 text-amber-500 justify-center font-bold">
                                <Lock className="h-5 w-5" />
                                DOSSIER PRIVÉ
                            </div>
                            <p className="text-slate-400 text-sm">
                                Ce dossier médical nécessite une autorisation explicite du médecin traitant pour être consulté.
                            </p>
                            <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-violet-400" />
                                Demander l'autorisation d'accès
                            </button>
                        </div>
                    ) : (
                        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl w-full space-y-4">
                            <div className="flex items-center gap-3 text-green-500 justify-center font-bold">
                                <ShieldCheck className="h-5 w-5" />
                                ACCÈS PUBLIC AUTORISÉ
                            </div>
                            <p className="text-slate-400 text-sm">
                                Les professionnels de santé peuvent consulter ce dossier après authentification.
                            </p>
                            <Link
                                href="/auth/login"
                                className="w-full block bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-bold transition-all text-center"
                            >
                                Se connecter pour voir le dossier
                            </Link>
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/5 w-full">
                        <Link
                            href="/booking"
                            className="flex items-center justify-center gap-2 text-pink-400 font-bold hover:text-pink-300 transition-all group"
                        >
                            <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Prendre rendez-vous avec ce patient →
                        </Link>
                    </div>
                </div>
            </div>

            <Link href="/" className="mt-8 text-slate-500 text-sm hover:text-slate-300 flex items-center gap-2">
                Retour à l'accueil Gynaeasy
            </Link>
        </div>
    );
}
