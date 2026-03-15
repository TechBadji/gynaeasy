import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search } from "lucide-react";
import NewPatientModal from "@/components/patients/new-patient-modal";

export default async function PatientsPage() {
    const patients = await prisma.patient.findMany({
        orderBy: { nom: "asc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patients</h1>
                {/* Bouton "Nouveau Patient" connecté au modal */}
                <NewPatientModal />
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Nom, téléphone..."
                                className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                            />
                        </div>
                        <div className="relative w-full sm:w-48">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400 font-bold text-[10px] flex items-center justify-center border border-violet-200 rounded">#</span>
                            <input
                                type="text"
                                maxLength={5}
                                placeholder="Code Patient (5 chiffres)"
                                className="w-full pl-9 pr-4 py-2 text-sm border border-violet-100 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                            />
                        </div>
                    </div>
                    <span className="text-sm text-slate-500">
                        {patients.length} patient{patients.length > 1 ? "s" : ""}
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">ID Patient</th>
                                <th className="px-6 py-3 font-medium">Nom / Prénom</th>
                                <th className="px-6 py-3 font-medium">Date de naissance</th>
                                <th className="px-6 py-3 font-medium">Contact</th>
                                <th className="px-6 py-3 font-medium">Groupe</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((patient) => (
                                <tr key={patient.id} className="border-b hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono bg-violet-50 text-violet-600 px-2 py-1 rounded text-xs border border-violet-100">
                                            #{patient.codePatient}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <span className="text-slate-500 font-normal text-xs mr-1">{patient.civilite}</span>
                                        {patient.nom.toUpperCase()} {patient.prenom}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {patient.dateNaissance.toLocaleDateString("fr-FR")}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div>{patient.telephone || "-"}</div>
                                        {patient.email && (
                                            <div className="text-xs text-slate-400">{patient.email}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {patient.groupeSanguin ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {patient.groupeSanguin} {patient.rhesus}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/patients/${patient.id}`}
                                            className="text-pink-600 hover:text-pink-900 font-medium text-sm"
                                        >
                                            Ouvrir le dossier
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {patients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Aucun patient trouvé. Créez un nouveau dossier.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
