import { AlertCircle, FileText, Syringe, Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AlertsList({ doctorId }: { doctorId: string }) {
    // Fetch real unread notifications for this doctor
    const unreadNotifications = await prisma.notification.findMany({
        where: {
            userId: doctorId,
            read: false,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    });

    if (unreadNotifications.length === 0) {
        return (
            <div className="text-center py-8 text-slate-400 italic text-sm border rounded-lg bg-slate-50 border-dashed">
                Aucune alerte pour le moment.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {unreadNotifications.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg hover:border-violet-200 transition-colors bg-white">
                    <div className="p-2 rounded-full bg-violet-50">
                        <Bell className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                        <div className="text-sm font-medium">{alert.titre}</div>
                        <div className="text-xs text-slate-500">{alert.message}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
