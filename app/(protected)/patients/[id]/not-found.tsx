import Link from "next/link";
import { UserX, ArrowLeft } from "lucide-react";

export default function PatientNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                <UserX className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Patient introuvable</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
                Ce dossier patient n&apos;existe pas ou vous n&apos;y avez pas accès.
            </p>
            <Link
                href="/patients"
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all"
            >
                <ArrowLeft className="h-4 w-4" />
                Retour à la liste des patients
            </Link>
        </div>
    );
}
