"use client";

import { useState } from "react";
import GeneralSettings from "@/components/admin/general-settings";
import StaffManagement from "@/components/admin/staff-management";
import ActeManagement from "@/components/admin/acte-management";
import { Settings, Users, ClipboardList } from "lucide-react";

export default function AdminClient({ initialSettings, users, actes }: any) {
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        { id: "general", label: "Paramètres Généraux", icon: Settings },
        { id: "staff", label: "Gestion du Personnel", icon: Users },
        { id: "actes", label: "Catalogue CCAM", icon: ClipboardList },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Administration</h1>
                <p className="text-slate-500 text-sm">Gérez les paramètres de la clinique et les accès du personnel.</p>
            </div>

            <div className="flex bg-white p-1 rounded-lg border shadow-sm w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                                    ? "bg-pink-50 text-pink-700 shadow-sm border-pink-100 border"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 animate-in fade-in duration-500">
                {activeTab === "general" && <GeneralSettings settings={initialSettings} />}
                {activeTab === "staff" && <StaffManagement users={users} />}
                {activeTab === "actes" && <ActeManagement actes={actes} />}
            </div>
        </div>
    );
}
