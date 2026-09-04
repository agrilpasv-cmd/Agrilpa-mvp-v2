import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { cancelPendingChatEmail } from "@/lib/chat-notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, userId } = body;

    if (!conversationId || !userId) {
      return NextResponse.json({ error: "Falta conversationId o userId" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Mark all unread messages where sender is NOT the current user
    const readTimestamp = new Date().toISOString();
    const { data, error } = await adminClient
      .from("messages")
      .update({ read_at: readTimestamp })
      .eq("conversation_id", conversationId)
      .or(`sender_id.neq.${userId},sender_id.is.null`)
      .is("read_at", null)
      .select("id");

    if (error) {
      console.error("[Mark as Read API] Error updating messages:", error);
      return NextResponse.json({ error: "Error al marcar como leído" }, { status: 500 });
    }

    // Cancel any pending debounced email notification for this conversation since the user read them
    cancelPendingChatEmail(conversationId, userId);

    return NextResponse.json({ success: true, updatedCount: data?.length || 0 });
  } catch (error) {
    console.error("[Mark as Read API] Server error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
