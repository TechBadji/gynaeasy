"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Clock, Check, MoreHorizontal, Settings, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import toast from "react-hot-toast";

const TYPE_MAP: Record<string, { icon: any; color: string; bg: string }> = {
    INFO: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10" },
    SUCCESS: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    WARNING: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
    ERROR: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
    URGENT: { icon: Shield, color: "text-pink-400", bg: "bg-pink-400/10" },
};

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifs = async () => {
        const data = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifs();
        // Optionnel: polling toutes les 2 minutes
        const interval = setInterval(fetchNotifs, 120000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        const res = await markAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        const res = await markAllAsRead();
        if (res.success) {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("Toutes les notifications sont lues");
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
                <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'animate-swing' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-pink-500 border-2 border-[#0d1526]"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div>
                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Vous avez {unreadCount} alertes non lues</p>
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                            >
                                <Check className="h-3 w-3" />
                                Tout lire
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500 text-xs font-medium">Chargement...</div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const Config = TYPE_MAP[notif.type] || TYPE_MAP.INFO;
                                const Icon = Config.icon;
                                return (
                                    <div 
                                        key={notif.id}
                                        className={`p-4 border-b border-white/[0.02] flex gap-4 transition-colors hover:bg-white/[0.03] relative group ${!notif.read ? 'bg-white/[0.01]' : 'opacity-60'}`}
                                    >
                                        {!notif.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
                                        )}
                                        <div className={`h-10 w-10 rounded-xl ${Config.bg} flex items-center justify-center ${Config.color} flex-shrink-0 mt-1`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <p className={`text-xs font-bold truncate ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                                                    {notif.titre}
                                                </p>
                                                <span className="text-[9px] text-slate-500 flex items-center gap-1">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                                                {notif.message}
                                            </p>
                                            {!notif.read && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notif.id);
                                                    }}
                                                    className="text-[9px] font-black text-violet-400 uppercase tracking-widest hover:text-violet-300"
                                                >
                                                    Marquer comme lu
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center space-y-3 opacity-20">
                                <Bell className="h-12 w-12 text-slate-400" />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aucune notification</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                        <button className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-tighter">
                            Voir toutes les archives
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
