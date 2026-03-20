import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Calendar, Settings, FileText, Activity, Shield, Package } from "lucide-react";
import UserProfileNav from "@/components/protected/user-profile-nav";
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
        select: { enabledModules: true, role: true, image: true, name: true, email: true }
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

            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-10 relative">
                    <div className="flex items-center md:hidden">
                        <Activity className="h-6 w-6 text-pink-600 mr-2" />
                        <span className="font-bold text-lg text-slate-800">Gynaeasy</span>
                    </div>
                    <div className="hidden md:block flex-1"></div>
                    <div className="flex items-center justify-end">
                        <UserProfileNav 
                            user={{
                                id: userId,
                                name: user?.name || session.user?.name,
                                email: user?.email || session.user?.email,
                                image: user?.image
                            }} 
                        />
                    </div>
                </header>
                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
