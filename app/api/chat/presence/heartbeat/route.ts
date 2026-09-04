import { type NextRequest, NextResponse } from "next/server";
import { recordUserPresence } from "@/lib/chat-notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, inMessagesPage } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    recordUserPresence(userId, Boolean(inMessagesPage));

    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (error) {
    console.error("[Presence Heartbeat API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
