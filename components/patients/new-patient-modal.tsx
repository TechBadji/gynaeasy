"use client";

import { useState, useRef } from "react";
import { UserPlus, X, Loader2 } from "lucide-react";
import { createPatient, type PatientFormState } from "@/app/actions/patient";

const initialState: PatientFormState = {
    success: false,
    message: "",
};

export default function NewPatientModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState<PatientFormState>(initialState);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setState(initialState);

        const formData = new FormData(e.currentTarget);
        const result = await createPatient(formData);
        setState(result);
        setIsLoading(false);

        if (result.success) {
            formRef.current?.reset();
            // Fermer le modal après un court délai pour montrer le message de succès
            setTimeout(() => {
                setIsOpen(false);
                setState(initialState);
            }, 1500);
        }
    };

    const inputClass =
        "mt-1 block w-full border border-slate-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";
    const labelClass = "block text-sm font-medium text-slate-700";
    const errorClass = "text-xs text-red-600 mt-1";

    return (
        <>
            {/* Bouton déclencheur */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
            >
                <UserPlus className="h-4 w-4 mr-2" />
                Nouveau Patient
            </button>

            {/* Overlay & Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dialog */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Nouveau Dossier Patient
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Renseignez les informations administratives et médicales
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <form ref={formRef} onSubmit={handleSubmit} id="new-patient-form">
                                {/* Feedback */}
                                {state.message && (
                                    <div
                                        className={`mb-4 p-3 rounded-md text-sm ${state.success
                                            ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                                            : "bg-red-50 border-l-4 border-red-500 text-red-700"
                                            }`}
                                    >
                                        {state.message}
                                    </div>
                                )}

                                {/* Section : Identité */}
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                    Identité
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label htmlFor="civilite" className={labelClass}>
                                            Civilité *
                                        </label>
                                        <select name="civilite" id="civilite" required className={inputClass}>
                                            <option value="MME">Mme</option>
                                            <option value="MLLE">Mlle</option>
                                            <option value="M">M.</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="nom" className={labelClass}>
                                            Nom *
                                        </label>
                                        <input
                                            id="nom"
                                            name="nom"
                                            type="text"
                                            required
                                            autoComplete="family-name"
                                            className={inputClass}
                                            placeholder="DIOP"
                                        />
                                        {state.errors?.nom && (
                                            <p className={errorClass}>{state.errors.nom[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="prenom" className={labelClass}>
                                            Prénom *
                                        </label>
                                        <input
                                            id="prenom"
                                            name="prenom"
                                            type="text"
                                            required
                                            autoComplete="given-name"
                                            className={inputClass}
                                            placeholder="Fatou"
                                        />
                                        {state.errors?.prenom && (
                                            <p className={errorClass}>{state.errors.prenom[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="dateNaissance" className={labelClass}>
                                            Date de naissance *
                                        </label>
                                        <input
                                            id="dateNaissance"
                                            name="dateNaissance"
                                            type="date"
                                            required
                                            className={inputClass}
                                        />
                                        {state.errors?.dateNaissance && (
                                            <p className={errorClass}>{state.errors.dateNaissance[0]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="telephone" className={labelClass}>
                                            Téléphone
                                        </label>
                                        <input
                                            id="telephone"
                                            name="telephone"
                                            type="tel"
                                            className={inputClass}
                                            placeholder="77 123 45 67"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className={labelClass}>
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            className={inputClass}
                                            placeholder="patient@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Section : Médical */}
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                    Informations Médicales
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <label htmlFor="isPublic" className={labelClass}>
                                            Confidentialité dossier
                                        </label>
                                        <select
                                            name="isPublic"
                                            id="isPublic"
                                            className={inputClass}
                                            defaultValue="false"
                                        >
                                            <option value="false">Privé (Traitant uniquement)</option>
                                            <option value="true">Public (Visible par tous)</option>
                                        </select>
                                        <p className="text-[10px] text-slate-400 mt-1 italic">
                                            Un code patient à 5 chiffres sera auto-généré.
                                        </p>
                                    </div>
                                    <div>
                                        <label htmlFor="groupeSanguin" className={labelClass}>
                                            Groupe sanguin
                                        </label>
                                        <select name="groupeSanguin" id="groupeSanguin" className={inputClass}>
                                            <option value="">-- Inconnu --</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="AB">AB</option>
                                            <option value="O">O</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="rhesus" className={labelClass}>
                                            Rhésus
                                        </label>
                                        <select name="rhesus" id="rhesus" className={inputClass}>
                                            <option value="">-- Inconnu --</option>
                                            <option value="+">Positif (+)</option>
                                            <option value="-">Négatif (-)</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-3">
                                        <label htmlFor="antecedentsMedicaux" className={labelClass}>
                                            Antécédents médicaux
                                        </label>
                                        <textarea
                                            id="antecedentsMedicaux"
                                            name="antecedentsMedicaux"
                                            rows={3}
                                            className={inputClass}
                                            placeholder="Allergies, antécédents chirurgicaux, maladies chroniques..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t bg-slate-50 rounded-b-xl">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                form="new-patient-form"
                                disabled={isLoading}
                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-pink-600 rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Créer le dossier
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
