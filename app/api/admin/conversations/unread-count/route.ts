import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { isConversationSeenByAdmin } from "@/lib/admin-chat-seen-state";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminClient = createAdminClient();

    // Fetch all conversations with updated_at
    const { data: convos, error } = await adminClient
      .from("conversations")
      .select("id, updated_at");

    if (error || !convos || convos.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // Fetch latest message dates
    const { data: latestMsgs } = await adminClient
      .from("messages")
      .select("conversation_id, created_at")
      .order("created_at", { ascending: false });

    const latestMsgMap = new Map<string, string>();
    if (latestMsgs) {
      for (const m of latestMsgs) {
        if (!latestMsgMap.has(m.conversation_id)) {
          latestMsgMap.set(m.conversation_id, m.created_at);
        }
      }
    }

    // Count how many conversations are unseen by the admin
    let unseenCount = 0;
    for (const c of convos) {
      const effectiveDate = latestMsgMap.get(c.id) || c.updated_at;
      const seen = isConversationSeenByAdmin(c.id, effectiveDate);
      if (!seen) {
        unseenCount++;
      }
    }

    return NextResponse.json({
      success: true,
      unreadCount: unseenCount,
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("[Admin Conversations Unread Count API] Error:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
