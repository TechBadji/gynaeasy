import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Calendar, Settings, FileText, Activity, Shield, Package } from "lucide-react";
import LogoutButton from "@/components/auth/logout-button";
import { prisma } from "@/lib/prisma";
import SidebarNav from "@/components/protected/sidebar-nav";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { enabledModules: true, role: true }
    });

    const isImagingEnabled = (user as any)?.enabledModules?.includes("IMAGERIE");

    if (user?.role === "ADMIN") {
        redirect("/admin");
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b">
                    <Activity className="h-6 w-6 text-pink-600 mr-2" />
                    <span className="font-bold text-lg text-slate-800">Gynaeasy</span>
                </div>
                <SidebarNav
                    role={user?.role || "GUEST"}
                    isImagingEnabled={!!isImagingEnabled}
                    isAdmin={(session.user as any)?.role === "ADMIN"}
                />
                <div className="p-4 border-t">
                    <div className="flex items-center px-3 py-2">
                        <div className="flex-shrink-0">
                            <span className="inline-block h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
                                <svg className="h-full w-full text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-700">{session.user?.name || "Médecin"}</p>
                            <p className="text-xs font-medium text-slate-500">{session.user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-2 px-1">
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 md:hidden">
                    <div className="flex items-center">
                        <Activity className="h-6 w-6 text-pink-600 mr-2" />
                        <span className="font-bold text-lg text-slate-800">Gynaeasy</span>
                    </div>
                </header>
                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
