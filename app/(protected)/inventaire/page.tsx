import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InventoryDashboard from "@/components/inventory/inventory-dashboard";

export default async function InventairePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    const userId = (session.user as any).id;

    let stockItems: any[] = [];
    try {
        stockItems = await prisma.stockItem.findMany({
            where: { userId },
            orderBy: { nom: "asc" },
        });
    } catch (err) {
        console.error("Inventaire fetch error:", err);
    }

    return <InventoryDashboard initialItems={stockItems} />;
}
