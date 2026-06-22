import { NextRequest, NextResponse } from "next/server";
import { sendDailyReminders } from "@/app/actions/reminders";

export const runtime = "nodejs";

// Called daily by an external cron (e.g. cron-job.org) with Bearer CRON_SECRET
// Example: GET /api/reminders/cron  Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await sendDailyReminders(tomorrow);
    return NextResponse.json({ ...result, triggeredAt: new Date().toISOString() });
}
