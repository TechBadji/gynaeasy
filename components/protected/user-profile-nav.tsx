"use client";

import { useState, useRef, useTransition } from "react";
import { LogOut, User as UserIcon, Camera, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { updateUserAvatar } from "@/app/actions/user";
import toast from "react-hot-toast";

interface UserProfileNavProps {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function UserProfileNav({ user }: UserProfileNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUploading, startTransition] = useTransition();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/login" });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Veuillez sélectionner une image valide.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB max
            toast.error("L'image est trop volumineuse (max 2 Mo).");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            
            startTransition(async () => {
                const result = await updateUserAvatar(user.id, base64String);
                if (result.success) {
                    toast.success("Avatar mis à jour avec succès");
                } else {
                    toast.error(result.error || "Erreur lors de la mise à jour");
                }
            });
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const getInitials = (name?: string | null) => {
        if (!name) return "Dr";
        const parts = name.split(" ");
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div className="relative">
            {/* Nav Trigger */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{user.name || "Médecin"}</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-none">{user.email}</p>
                </div>
                
                <div className="relative h-10 w-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm flex items-center justify-center">
                    {user.image ? (
                        <img src={user.image} alt={user.name || "Avatar"} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-slate-500 font-bold text-sm tracking-wide">{getInitials(user.name)}</span>
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                        
                        {/* Avatar Modifiable */}
                        <div className="p-4 flex flex-col items-center text-center border-b border-slate-100 mb-2">
                            <div className="relative group cursor-pointer mb-3" onClick={triggerFileInput}>
                                <div className="h-20 w-20 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center group-hover:blur-[2px] transition-all">
                                    {isUploading ? (
                                        <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                                    ) : user.image ? (
                                        <img src={user.image} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <UserIcon className="h-8 w-8 text-slate-400" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                                    <Camera className="h-6 w-6 mb-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Modifier</span>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    title="Choisir un avatar" 
                                />
                            </div>
                            <p className="font-bold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-1">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    handleLogout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
