import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InventoryDashboard from "@/components/inventory/inventory-dashboard";

export default async function InventairePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/api/auth/signin");

    // Récupérer les articles en stock
    const stockItems = await prisma.stockItem.findMany({
        orderBy: { nom: "asc" }
    });

    return (
        <InventoryDashboard initialItems={stockItems} />
    );
}
