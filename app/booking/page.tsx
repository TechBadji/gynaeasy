"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Activity,
    Calendar,
    Clock,
    User,
    ChevronRight,
    Search,
    Stethoscope,
    CheckCircle2,
    ArrowLeft,
    Check,
    AlertCircle,
    Flame
} from "lucide-react";
import Link from "next/link";
// We'll need a new action to get active doctors
import { getActiveDoctors } from "@/app/actions/superadmin";
import { validatePatientPhone, createOnlineAppointment } from "@/app/actions/booking";
import toast from "react-hot-toast";

export default function BookingPage() {
    const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Date/Slot, 3: Patient Info/Code, 4: Success
    const [isPending, startTransition] = useTransition();

    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedSlot, setSelectedSlot] = useState<string>("");
    const [phone, setPhone] = useState("");
    const [validatedPatient, setValidatedPatient] = useState<any>(null);
    const [bookingType, setBookingType] = useState<"CONSULTATION" | "URGENCE">("CONSULTATION");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                // We'll use the existing getAllUsers and filter for doctors or add a specific action
                // For now, let's assume getActiveDoctors exists or use a dummy list if it fails
                const res = await getActiveDoctors();
                setDoctors(res);
            } catch (error) {
                console.error("Failed to fetch doctors", error);
            }
        };
        fetchDoctors();
    }, []);

    const handleSelectDoctor = (doctor: any) => {
        setSelectedDoctor(doctor);
        if (bookingType === "URGENCE") {
            setSelectedDate(new Date().toISOString().split('T')[0]);
        }
        setStep(2);
    };

    const handleValidateCode = async () => {
        if (!phone || phone.length < 8) return;
        startTransition(async () => {
            const patient = await validatePatientPhone(phone);
            if (patient) {
                setValidatedPatient(patient);
                toast.success(`Bonjour ${patient.prenom} !`);
            } else {
                toast.error("Numéro de téléphone inconnu. Contactez le cabinet.");
            }
        });
    };

    const handleConfirmBooking = async () => {
        if (!validatedPatient || !selectedDoctor || !selectedDate || !selectedSlot) return;

        startTransition(async () => {
            const dateTime = `${selectedDate}T${selectedSlot}:00`;
            const res = await createOnlineAppointment(
                validatedPatient.id,
                selectedDoctor.id,
                dateTime,
                bookingType
            );
            if (res.success) {
                setStep(4);
            } else {
                toast.error("Erreur lors de la réservation.");
            }
        });
    };

    // Simplified slots for demo
    const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "14:0)0", "14:30", "15:00", "15:30"];
    const futureDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return d.toISOString().split('T')[0];
    });

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-violet-600 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tighter">Gynaeasy</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Étape {step} sur 4
                        </div>
                        <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-violet-600 transition-all duration-500"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* STEP 1: SELECT CATEGORY & DOCTOR */}
                {step === 1 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-black tracking-tight mb-2">Prendre rendez-vous</h1>
                            <p className="text-slate-500 font-medium">Choisissez le type de consultation dont vous avez besoin.</p>
                        </div>

                        {/* Category Selector */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                            <button 
                                onClick={() => setBookingType("CONSULTATION")}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${bookingType === "CONSULTATION" ? "border-violet-600 bg-violet-50/50 shadow-xl shadow-violet-500/10" : "border-slate-100 bg-white hover:border-slate-200"}`}
                            >
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${bookingType === "CONSULTATION" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                    <Activity className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className={`font-black ${bookingType === "CONSULTATION" ? "text-violet-900" : "text-slate-900"}`}>Consultation Standard</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Prise de rendez-vous classique sur les disponibilités de la semaine.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setBookingType("URGENCE")}
                                className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${bookingType === "URGENCE" ? "border-orange-500 bg-orange-50/50 shadow-xl shadow-orange-500/10" : "border-slate-100 bg-white hover:border-slate-200"}`}
                            >
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${bookingType === "URGENCE" ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className={`font-black ${bookingType === "URGENCE" ? "text-orange-900" : "text-slate-900"}`}>Urgence Aujourd'hui</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Médecins disponibles pour vous recevoir immédiatement ou dans la journée.</p>
                                </div>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                {bookingType === "URGENCE" ? "Médecins d'Urgence" : "Spécialistes disponibles"}
                                {bookingType === "URGENCE" && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-black animate-pulse">En ligne maintenant</span>}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                {doctors
                                    .filter(doc => bookingType === "CONSULTATION" || doc.isEmergencyAvailable)
                                    .map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleSelectDoctor(doc)}
                                        className={`p-6 bg-white border border-slate-200 rounded-3xl text-left hover:border-violet-500 hover:shadow-xl transition-all group ${bookingType === "URGENCE" ? "hover:border-orange-500" : ""}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400 transition-colors ${bookingType === "URGENCE" ? "group-hover:bg-orange-50 group-hover:text-orange-500" : "group-hover:bg-violet-50 group-hover:text-violet-500"}`}>
                                                {doc.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-xl font-bold transition-colors ${bookingType === "URGENCE" ? "group-hover:text-orange-600" : "group-hover:text-violet-600"}`}>{doc.name}</h3>
                                                <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mt-1">
                                                    <Stethoscope className="h-3.5 w-3.5" />
                                                    {doc.specialite || "Médecin"}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    {bookingType === "URGENCE" ? (
                                                        <span className="text-xs font-bold text-orange-500 flex items-center gap-1">
                                                            <Flame className="h-3.5 w-3.5" /> Disponible immédiatement
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Disponible cette semaine
                                                        </span>
                                                    )}
                                                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {bookingType === "URGENCE" && doctors.filter(doc => doc.isEmergencyAvailable).length === 0 && (
                                    <div className="md:col-span-2 p-12 text-center bg-white border border-slate-100 rounded-[2.5rem]">
                                        <p className="text-slate-400 font-medium">Aucun médecin n'est disponible en urgence pour le moment. Veuillez choisir une consultation standard.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: SELECT DATE & SLOT */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Retour au choix du médecin
                        </button>

                        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                                <div className="h-12 w-12 rounded-xl bg-violet-600 flex items-center justify-center text-white font-black">
                                    {selectedDoctor.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">{selectedDoctor.name}</h2>
                                    <p className="text-xs text-slate-500 font-medium">Disponibilités de la semaine</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 block">1. Choisir la date</label>
                                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                                        {futureDates.map((date) => {
                                            const d = new Date(date);
                                            const isSelected = selectedDate === date;
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`flex-shrink-0 w-24 p-4 rounded-2xl border transition-all text-center ${isSelected
                                                            ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20 scale-105"
                                                            : "bg-white border-slate-200 hover:border-violet-200 text-slate-600"
                                                        }`}
                                                >
                                                    <p className={`text-[10px] font-black uppercase mb-1 ${isSelected ? "text-violet-200" : "text-slate-400"}`}>
                                                        {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                                                    </p>
                                                    <p className="text-xl font-black">{d.getDate()}</p>
                                                    <p className={`text-[10px] font-bold ${isSelected ? "text-violet-200" : "text-slate-400"}`}>
                                                        {d.toLocaleDateString('fr-FR', { month: 'short' })}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {selectedDate && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 block">2. Choisir l'heure</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                            {slots.map((slot) => {
                                                const isSelected = selectedSlot === slot;
                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`py-3 rounded-xl border font-bold text-sm transition-all ${isSelected
                                                                ? "bg-violet-600 border-violet-600 text-white shadow-md"
                                                                : "bg-white border-slate-200 hover:border-violet-200 text-slate-600"
                                                            }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedSlot && (
                                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
                                    >
                                        Continuer <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: PATIENT INFO / CODE */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-xl mx-auto">
                        <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> Retour au calendrier
                        </button>

                        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm text-center">
                            <h2 className="text-2xl font-black mb-2">Identifiez-vous</h2>
                            <p className="text-slate-500 mb-8 font-medium">Saisissez votre numéro de téléphone pour confirmer.</p>

                            <div className="space-y-6">
                                <div className="relative">
                                    <input
                                        type="tel"
                                        placeholder="Numéro de téléphone"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-6 text-center text-xl font-black focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-300"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    {validatedPatient && (
                                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-left">
                                            <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                                <Check className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{validatedPatient.prenom} {validatedPatient.nom}</p>
                                                <p className="text-xs text-emerald-600 font-bold">Patient Identifié</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!validatedPatient ? (
                                    <button
                                        onClick={handleValidateCode}
                                        disabled={isPending || phone.length < 8}
                                        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-5 rounded-2xl font-black shadow-lg shadow-violet-500/20 transition-all active:scale-95"
                                    >
                                        {isPending ? "Vérification..." : "Vérifier mon code"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={isPending}
                                        className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95"
                                    >
                                        {isPending ? "Confirmation..." : "Confirmer le rendez-vous"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: SUCCESS */}
                {step === 4 && (
                    <div className="min-h-[60vh] flex items-center justify-center text-center animate-in zoom-in duration-500">
                        <div className="space-y-8 max-w-md">
                            <div className="h-24 w-24 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/30">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-slate-900">C'est confirmé !</h1>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Votre rendez-vous avec le <span className="text-slate-900 font-bold">{selectedDoctor.name}</span> est enregistré pour le <span className="text-violet-600 font-bold">{new Date(selectedDate).toLocaleDateString('fr-FR')} à {selectedSlot}</span>.
                                </p>
                            </div>
                            <div className="pt-8">
                                <Link
                                    href="/"
                                    className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl block"
                                >
                                    Fermer
                                </Link>
                                <p className="text-slate-400 text-xs mt-6 font-bold uppercase tracking-widest">
                                    Un SMS de rappel vous sera envoyé 24h avant.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
