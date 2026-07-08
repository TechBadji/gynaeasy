export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPatientsBroadcastList } from "@/app/actions/reminders";
import SmsBroadcast from "@/components/sms/sms-broadcast";
import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Communications SMS — Gynaeasy" };

export default async function SmsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/auth/login");

    const role = (session.user as any).role;
    if (!["MEDECIN", "SECRETAIRE", "ADMIN"].includes(role)) redirect("/dashboard");

    const userId = (session.user as any).id;
    const [patients, user] = await Promise.all([
        getPatientsBroadcastList(),
        prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    ]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Communications SMS</h1>
                    <p className="text-sm text-slate-500">
                        Rappels de rendez-vous et messages groupés aux patients
                        {patients.length > 0 && ` — ${patients.length} patient${patients.length > 1 ? "s" : ""} avec numéro`}
                    </p>
                </div>
            </div>

            <SmsBroadcast patients={patients} role={role} doctorName={user?.name ?? ""} />
        </div>
    );
}
