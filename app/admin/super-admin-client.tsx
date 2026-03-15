"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard, Users, CreditCard, ClipboardList,
    Settings, Shield, Activity, LogOut, ChevronRight,
    Bell, Search
} from "lucide-react";
import SuperAdminOverview from "@/components/admin/super/overview";
import SuperAdminUsers from "@/components/admin/super/users-management";
import SuperAdminAbonnements from "@/components/admin/super/abonnements";
import SuperAdminCCAM from "@/components/admin/super/ccam-management";
import SuperAdminSettings from "@/components/admin/super/app-settings";
import SuperAdminAudit from "@/components/admin/super/audit-logs";
import SuperAdminPricing from "@/components/admin/super/pricing-management";
import SuperAdminPromotions from "@/components/admin/super/promotions-management";
import SuperAdminApprovals from "@/components/admin/super/approvals";

const NAV_ITEMS = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "validations", label: "Validations", icon: ClipboardList, badge: true },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "abonnements", label: "Abonnements", icon: CreditCard },
    { id: "pricing", label: "Prix & Plans", icon: Settings },
    { id: "promotions", label: "Promotions", icon: Shield },
    { id: "ccam", label: "Catalogue CCAM", icon: ClipboardList },
    { id: "settings", label: "Paramètres App", icon: Settings },
    { id: "audit", label: "Audit Log", icon: Shield },
];

interface SuperAdminClientProps {
    stats: any;
    users: any[];
    abonnements: any[];
    actes: any[];
    settings: any;
    auditLogs: any[];
    planConfigs: any[];
    promotions: any[];
    pendingUsers: any[];
    adminEmail: string;
}

export default function SuperAdminClient({
    stats,
    users,
    abonnements,
    actes,
    settings,
    auditLogs,
    planConfigs,
    promotions,
    pendingUsers,
    adminEmail
}: SuperAdminClientProps) {
    const [activeTab, setActiveTab] = useState("overview");
    const [searchQuery, setSearchQuery] = useState("");

    const activeItem = NAV_ITEMS.find(n => n.id === activeTab);

    return (
        <div className="flex min-h-screen bg-[#0a0f1e] text-white">
            {/* ========== SIDEBAR ========== */}
            <aside className="w-72 bg-[#0d1526] border-r border-white/5 flex flex-col flex-shrink-0">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-white">Gynaeasy</p>
                            <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-widest">Super Admin</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 pb-2 pt-1">Navigation</p>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                    ? "bg-gradient-to-r from-violet-500/20 to-pink-500/10 text-white border border-violet-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`h-4 w-4 ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                    {item.label}
                                </div>
                                {item.badge && pendingUsers.length > 0 && (
                                    <span className="bg-pink-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                                        {pendingUsers.length}
                                    </span>
                                )}
                                {isActive && <ChevronRight className="h-3 w-3 text-violet-400" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Admin info */}
                <div className="p-4 border-t border-white/5">
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                SA
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">Super Administrateur</p>
                                <p className="text-xs text-slate-400 truncate">{adminEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors py-1 mt-1"
                        >
                            <LogOut className="h-3 w-3" />
                            Déconnexion
                        </button>
                    </div>
                </div>
            </aside>

            {/* ========== MAIN CONTENT ========== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-[#0d1526]/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-500">Admin</span>
                        <ChevronRight className="h-3 w-3 text-slate-600" />
                        <span className="text-white font-medium">{activeItem?.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Recherche globale..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 w-64 transition-all"
                            />
                        </div>
                        <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-pink-500"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    {activeTab === "overview" && <SuperAdminOverview stats={stats} />}
                    {activeTab === "validations" && <SuperAdminApprovals pendingUsers={pendingUsers} />}
                    {activeTab === "users" && <SuperAdminUsers users={users} searchQuery={searchQuery} />}
                    {activeTab === "abonnements" && <SuperAdminAbonnements abonnements={abonnements} users={users} promotions={promotions} />}
                    {activeTab === "pricing" && <SuperAdminPricing planConfigs={planConfigs} />}
                    {activeTab === "promotions" && <SuperAdminPromotions promotions={promotions} />}
                    {activeTab === "ccam" && <SuperAdminCCAM actes={actes} searchQuery={searchQuery} />}
                    {activeTab === "settings" && <SuperAdminSettings settings={settings} />}
                    {activeTab === "audit" && <SuperAdminAudit logs={auditLogs} />}
                </main>
            </div>
        </div>
    );
}
