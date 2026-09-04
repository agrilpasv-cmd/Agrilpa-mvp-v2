import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

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

    // 2. Fetch support conversations
    const { data: convos } = await adminClient
      .from("conversations")
      .select("id")
      .is("product_id", null);

    if (!convos || convos.length === 0) {
      return NextResponse.json({ unreadCount: 0 });
    }

    const convIds = convos.map((c) => c.id);

    // 3. Count unread messages sent to admin
    const { count, error } = await adminClient
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convIds)
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
