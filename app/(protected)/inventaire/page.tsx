export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InventoryDashboard from "@/components/inventory/inventory-dashboard";
import { getEffectiveDoctorId } from "@/lib/effective-user";

export default async function InventairePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    const userId   = (session.user as any).id;
    const role     = (session.user as any).role;
    const doctorId = await getEffectiveDoctorId(userId, role);

    let stockItems: any[] = [];
    try {
        stockItems = await prisma.stockItem.findMany({
            where: { userId: doctorId },
            orderBy: { nom: "asc" },
        });
    } catch (err) {
        console.error("Inventaire fetch error:", err);
    }

    return <InventoryDashboard initialItems={stockItems} />;
}
