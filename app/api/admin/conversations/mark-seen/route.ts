import { type NextRequest, NextResponse } from "next/server";
import { markConversationAdminSeen } from "@/lib/admin-chat-seen-state";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, seen = true } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "Falta conversationId" }, { status: 400 });
    }

    const record = markConversationAdminSeen(conversationId, Boolean(seen));

    return NextResponse.json({
      success: true,
      record,
      is_seen: Boolean(seen),
    });
  } catch (error) {
    console.error("[Mark Seen API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
