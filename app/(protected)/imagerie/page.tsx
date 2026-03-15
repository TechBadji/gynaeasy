import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImagingDashboard from "@/components/imagerie/imaging-dashboard";
import { getClinicSettings } from "@/app/actions/clinic";

export default async function ImagingPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    const userId = (session.user as any).id;

    // Récupérer les données en parallèle
    const [user, recentScans, clinicSettings] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { enabledModules: true }
        }),
        prisma.document.findMany({
            where: {
                type: "ECHOGRAPHIE"
            },
            include: {
                patient: {
                    select: {
                        nom: true,
                        prenom: true,
                        codePatient: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        }),
        getClinicSettings()
    ]);

    // Sécurité : Vérifier si le module est activé
    if (!user?.enabledModules.includes("IMAGERIE")) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="bg-amber-50 p-6 rounded-full">
                    <svg className="h-12 w-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Module non activé</h1>
                <p className="text-slate-500 max-w-md">
                    Le module d'imagerie médicale n'est pas activé pour votre compte.
                    Veuillez contacter le Super Administrateur pour y accéder.
                </p>
            </div>
        );
    }

    return <ImagingDashboard initialScans={recentScans} clinicSettings={clinicSettings} />;
}
