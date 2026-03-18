"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Activity,
    Shield,
    Package,
    Settings,
    CreditCard
} from "lucide-react";

interface SidebarNavProps {
    role: string;
    isImagingEnabled: boolean;
    isAdmin: boolean;
}

export default function SidebarNav({ role, isImagingEnabled, isAdmin }: SidebarNavProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        const normalizedPathname = pathname === "/" ? "/dashboard" : pathname;
        if (path === "/dashboard") {
            return normalizedPathname === "/dashboard" || normalizedPathname === "/dashboard/";
        }
        return normalizedPathname.startsWith(path);
    };

    const linkClass = (path: string) => {
        const active = isActive(path);
        return `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${active
            ? "text-pink-600 bg-pink-50 shadow-sm border border-pink-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
            }`;
    };

    const iconClass = (path: string, defaultColor: string) => {
        const active = isActive(path);
        return `h-5 w-5 mr-3 ${active ? "text-pink-600" : defaultColor}`;
    };

    return (
        <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
                <LayoutDashboard className={iconClass("/dashboard", "text-slate-500")} />
                Tableau de bord
            </Link>

            {role !== "SECRETAIRE" && (
                <Link href="/patients" className={linkClass("/patients")}>
                    <Users className={iconClass("/patients", "text-slate-400")} />
                    Patients
                </Link>
            )}

            <Link href="/agenda" className={linkClass("/agenda")}>
                <Calendar className={iconClass("/agenda", "text-slate-400")} />
                Agenda
            </Link>

            {role !== "SECRETAIRE" && isImagingEnabled && (
                <Link href="/imagerie" className={linkClass("/imagerie")}>
                    <Activity className={iconClass("/imagerie", "text-slate-400")} />
                    Imagerie Médicale
                </Link>
            )}

            <Link href="/facturation" className={linkClass("/facturation")}>
                <FileText className={iconClass("/facturation", "text-slate-400")} />
                Facturation & Encaissements
            </Link>

            <Link href="/inventaire" className={linkClass("/inventaire")}>
                <Package className={iconClass("/inventaire", "text-slate-400")} />
                Stocks & Inventaire
            </Link>

            {role !== "SECRETAIRE" && (
                <>
                    <Link href="/statistiques" className={linkClass("/statistiques")}>
                        <Activity className={iconClass("/statistiques", "text-slate-400")} />
                        Statistiques
                    </Link>
                    <Link href="/abonnement" className={linkClass("/abonnement")}>
                        <CreditCard className={iconClass("/abonnement", "text-slate-400")} />
                        Mon Abonnement
                    </Link>
                    <Link href="/parametres" className={linkClass("/parametres")}>
                        <Settings className={iconClass("/parametres", "text-slate-400")} />
                        Paramètres
                    </Link>
                </>
            )}

            {isAdmin && (
                <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-sm mt-2">
                    <Shield className="h-5 w-5 mr-3 text-violet-200" />
                    <span className="flex-1">Super Admin</span>
                    <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">SA</span>
                </Link>
            )}
        </nav>
    );
}
