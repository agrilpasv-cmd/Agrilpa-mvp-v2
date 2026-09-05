import { type NextRequest, NextResponse } from "next/server";
import { markConversationAdminSeen } from "@/lib/admin-chat-seen-state";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, seen = true } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "Falta conversationId" }, { status: 400 });
    }

    const record = markConversationAdminSeen(conversationId, Boolean(seen));

    // If marked as seen, also mark any unread messages in DB as read to clear support counters
    if (Boolean(seen)) {
      try {
        const adminClient = createAdminClient();
        await adminClient
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .is("read_at", null);
      } catch (dbErr) {
        console.error("[Mark Seen API] Error updating messages read_at:", dbErr);
      }
    }

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
