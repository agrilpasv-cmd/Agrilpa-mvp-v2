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

    if (error || !convos) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // Count how many conversations are unseen by the admin
    let unseenCount = 0;
    for (const c of convos) {
      const seen = isConversationSeenByAdmin(c.id, c.updated_at);
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
