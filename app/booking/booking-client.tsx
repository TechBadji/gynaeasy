"use client";

import { useState } from "react";
import { validatePatientCode, createOnlineAppointment, getDoctorAppointments } from "@/app/actions/booking";
import { CheckCircle2, User, Calendar, Clock, ArrowRight, ArrowLeft, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { format, addMinutes, startOfToday, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

interface Doctor {
    id: string;
    name: string | null;
    email: string | null;
}

export default function BookingClient({ doctors }: { doctors: Doctor[] }) {
    const [step, setStep] = useState(1);
    const [patientCode, setPatientCode] = useState("");
    const [patient, setPatient] = useState<any>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [doctorBusySlots, setDoctorBusySlots] = useState<Date[]>([]);

    const handleValidateCode = async () => {
        if (!patientCode) return;
        setIsPending(true);
        const res = await validatePatientCode(patientCode);
        setIsPending(false);
        if (res) {
            setPatient(res);
            setStep(2);
            toast.success(`Bonjour ${res.prenom} !`);
        } else {
            toast.error("Code patient invalide");
        }
    };

    const handleSelectDoctor = async (doctor: Doctor) => {
        setIsPending(true);
        setSelectedDoctor(doctor);
        const appointments = await getDoctorAppointments(doctor.id);
        setDoctorBusySlots(appointments.map(a => new Date(a.dateHeure)));
        setIsPending(false);
        setStep(3);
    };

    const generateSlots = () => {
        const slots = [];
        let start = new Date(selectedDate);
        start.setHours(8, 0, 0, 0); // Début à 8h

        for (let i = 0; i < 20; i++) { // 20 créneaux de 30 min
            const slotTime = addMinutes(start, i * 30);
            const isBusy = doctorBusySlots.some(busy => busy.getTime() === slotTime.getTime());
            slots.push({ time: slotTime, isBusy });
        }
        return slots;
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlot || !selectedDoctor || !patient) return;
        setIsPending(true);
        const res = await createOnlineAppointment(
            patient.id,
            selectedDoctor.id,
            selectedSlot,
            "CONSULTATION"
        );
        setIsPending(false);
        if (res.success) {
            setStep(4);
        } else {
            toast.error(res.message);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between px-4 sm:px-0">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= s ? "bg-violet-600 border-violet-600 text-white" : "border-white/10 text-slate-500"}`}>
                            {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                        </div>
                        <span className={`text-xs font-semibold hidden sm:block ${step >= s ? "text-white" : "text-slate-500"}`}>
                            {s === 1 ? "Identification" : s === 2 ? "Spécialiste" : "Rendez-vous"}
                        </span>
                        {s < 3 && <div className={`h-[2px] w-8 sm:w-16 ${step > s ? "bg-violet-600" : "bg-white/10"}`} />}
                    </div>
                ))}
            </div>

            {/* STEP 1: LOGIN */}
            {step === 1 && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                        <User className="h-8 w-8 text-violet-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Bienvenue sur Gynaeasy</h2>
                        <p className="text-slate-400">Entrez votre code patient à 5 chiffres pour continuer.</p>
                    </div>
                    <div className="max-w-xs mx-auto space-y-4">
                        <input
                            type="text"
                            maxLength={5}
                            placeholder="Ex: 12345"
                            value={patientCode}
                            onChange={(e) => setPatientCode(e.target.value)}
                            className="w-full bg-[#1a2340] border border-white/10 rounded-2xl px-6 py-4 text-center text-2xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                        <button
                            onClick={handleValidateCode}
                            disabled={isPending || patientCode.length < 5}
                            className="w-full bg-gradient-to-r from-violet-600 to-pink-600 py-4 rounded-2xl font-bold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continuer"}
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: DOCTOR SELECTION */}
            {step === 2 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep(1)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-2xl font-bold">Sélectionnez votre spécialiste</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {doctors.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => handleSelectDoctor(doc)}
                                className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 hover:border-violet-500/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">
                                        {doc.name?.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white group-hover:text-violet-400 transition-colors">Dr. {doc.name}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Gynécologue Obstétricien</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 3: DATE & TIME */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setStep(2)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold">Disponibilités</h2>
                            <p className="text-slate-400 text-sm italic">Dr. {selectedDoctor?.name}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Calendrier rapide */}
                        <div className="md:col-span-1 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Choisir un jour</h3>
                            <div className="space-y-2">
                                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                                    const d = addDays(startOfToday(), i);
                                    const active = isSameDay(d, selectedDate);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(d)}
                                            className={`w-full p-4 rounded-xl text-left border transition-all ${active ? "bg-violet-600 border-violet-600 text-white font-bold" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
                                        >
                                            <div className="text-xs opacity-70 uppercase font-bold">{format(d, "EEEE", { locale: fr })}</div>
                                            <div className="text-lg">{format(d, "d MMMM", { locale: fr })}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Créneaux */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Créneaux disponibles</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {generateSlots().map((slot, i) => {
                                    const timeStr = format(slot.time, "HH:mm");
                                    const isActive = selectedSlot === slot.time.toISOString();
                                    return (
                                        <button
                                            key={i}
                                            disabled={slot.isBusy}
                                            onClick={() => setSelectedSlot(slot.time.toISOString())}
                                            className={`p-4 rounded-xl border text-center transition-all ${slot.isBusy ? "opacity-20 cursor-not-allowed bg-slate-900 border-white/5" : isActive ? "bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-500/20 scale-105" : "bg-white/5 border-white/10 text-white hover:border-pink-500/50"}`}
                                        >
                                            <Clock className={`h-4 w-4 mx-auto mb-2 ${isActive ? "text-white" : "text-pink-400"}`} />
                                            <span className="text-sm font-bold tracking-widest">{timeStr}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {selectedSlot && (
                                <div className="pt-8">
                                    <button
                                        onClick={handleConfirmBooking}
                                        disabled={isPending}
                                        className="w-full bg-gradient-to-r from-violet-600 to-pink-600 py-4 rounded-2xl font-bold text-white shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirmer mon rendez-vous"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white">Rendez-vous Confirmé !</h2>
                        <p className="text-slate-400 max-w-sm mx-auto">
                            Votre rendez-vous avec le <span className="text-white font-bold">Dr. {selectedDoctor?.name}</span> a bien été enregistré pour le <span className="text-white font-bold">{format(new Date(selectedSlot!), "d MMMM à HH:mm", { locale: fr })}</span>.
                        </p>
                    </div>
                    <div className="pt-4">
                        <button
                            onClick={() => window.location.href = "/"}
                            className="text-violet-400 font-bold hover:text-violet-300 transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
