import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`check-2fa:${ip}`, 10, 60_000)) {
        return NextResponse.json({ twoFactorEnabled: false }, { status: 429 });
    }

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
