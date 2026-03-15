"use client";

import { useState } from "react";
import { requestAccess } from "@/app/actions/patient";
import { Lock, Loader2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

export default function AccessRequestButton({ patientId }: { patientId: string }) {
    const [isPending, setIsPending] = useState(false);

    const handleRequest = async () => {
        setIsPending(true);
        try {
            const res = await requestAccess(patientId);
            if (res.success) {
                toast.success("Demande d'accès envoyée par SMS au médecin traitant.");
            } else {
                toast.error(res.message || "Erreur lors de la demande.");
            }
        } catch (error) {
            toast.error("Erreur de connexion au serveur.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleRequest}
            disabled={isPending}
            className="px-6 py-2 bg-pink-600 text-white rounded-xl font-medium shadow-lg shadow-pink-200 hover:bg-pink-500 transition-all flex items-center gap-2 disabled:opacity-50"
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <ShieldAlert className="h-4 w-4" />
            )}
            Demander l'accès
        </button>
    );
}
