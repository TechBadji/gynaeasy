import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ twoFactorEnabled: false });
    }

    const user = await (prisma.user as any).findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { twoFactorEnabled: true },
    });

    return NextResponse.json({ twoFactorEnabled: user?.twoFactorEnabled ?? false });
}
