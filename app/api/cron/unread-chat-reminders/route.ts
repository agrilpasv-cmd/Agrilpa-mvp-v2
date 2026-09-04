import { type NextRequest, NextResponse } from "next/server";
import { checkAndSend24HourReminders } from "@/lib/chat-notifications";

export async function GET(request: NextRequest) {
  try {
    // Optional secret check if CRON_SECRET is configured in environment
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      const queryKey = url.searchParams.get("key");
      if (queryKey !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const results = await checkAndSend24HourReminders();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error("[Cron Reminders API] Error running job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
