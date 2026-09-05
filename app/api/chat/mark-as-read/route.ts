import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { cancelPendingChatEmail } from "@/lib/chat-notifications";
import { markConversationAdminSeen } from "@/lib/admin-chat-seen-state";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, userId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: "Falta conversationId" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const readTimestamp = new Date().toISOString();

    let query = adminClient
      .from("messages")
      .update({ read_at: readTimestamp })
      .eq("conversation_id", conversationId)
      .is("read_at", null);

    // If userId is provided and looks like a valid UUID, exclude messages sent by this user
    const isUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUuid) {
      query = query.or(`sender_id.neq.${userId},sender_id.is.null`);
    }

    const { data, error } = await query.select("id");

    if (error) {
      console.error("[Mark as Read API] Error updating messages:", error);
      return NextResponse.json({ error: "Error al marcar como leído" }, { status: 500 });
    }

    // Keep admin seen state synchronized
    try {
      markConversationAdminSeen(conversationId, true);
    } catch (seenErr) {
      console.error("[Mark as Read API] Error setting admin seen state:", seenErr);
    }

    // Cancel any pending debounced email notification for this conversation since the user read them
    if (userId) {
      cancelPendingChatEmail(conversationId, userId);
    }

    return NextResponse.json({ success: true, updatedCount: data?.length || 0 });
  } catch (error) {
    console.error("[Mark as Read API] Server error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
