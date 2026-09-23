import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getAllTicketMeta } from "@/lib/support-state";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const adminClient = createAdminClient();

    // 1. Fetch admin user id
    const { data: adminUser } = await adminClient
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    const adminId = adminUser?.id || "57b0c950-5397-42c9-b560-1459b21f8d8f";

    // 2. Fetch support conversations (where product_id is null)
    const { data: convos } = await adminClient
      .from("conversations")
      .select("id")
      .is("product_id", null);

    if (!convos || convos.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const allMeta = getAllTicketMeta();

    // Filter out tickets marked as resolved
    const activeConvIds = convos
      .filter((c) => {
        const meta = allMeta[c.id];
        return !meta || meta.status !== "resolved";
      })
      .map((c) => c.id);

    if (activeConvIds.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    // 3. Count unread messages sent to admin in open / in-progress tickets
    const { count, error } = await adminClient
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", activeConvIds)
      .neq("sender_id", adminId)
      .is("read_at", null);

    if (error) {
      console.error("[Support Unread API] Error:", error);
      return NextResponse.json({ unreadCount: 0 });
    }

    return NextResponse.json({ unreadCount: count || 0 });
  } catch (error) {
    console.error("[Support Unread API] Server error:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
