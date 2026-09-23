import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { updateTicketMeta } from "@/lib/support-state";
import { markConversationAdminSeen } from "@/lib/admin-chat-seen-state";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, status, priority, adminNotes } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const updated = updateTicketMeta(conversationId, {
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    });

    const adminClient = createAdminClient();

    // Mark messages as read in Supabase and sync admin seen state
    if (status === "resolved" || status === "in_progress") {
      try {
        await adminClient
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", conversationId)
          .is("read_at", null);

        markConversationAdminSeen(conversationId, true);
      } catch (dbErr) {
        console.error("[Support Status API] Error updating messages read_at:", dbErr);
      }
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error("[Support Status API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
