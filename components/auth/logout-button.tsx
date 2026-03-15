"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
            <LogOut className="h-5 w-5 mr-3 text-slate-400 group-hover:text-red-500" />
            Déconnexion
        </button>
    );
}
