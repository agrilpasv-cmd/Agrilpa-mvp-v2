import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { getAllTicketMeta, getTicketMeta } from "@/lib/support-state";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // 1. Fetch admin user
    const { data: adminUser } = await adminClient
      .from("users")
      .select("id, email, full_name")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    const adminId = adminUser?.id || "57b0c950-5397-42c9-b560-1459b21f8d8f";

    // 2. Fetch all support conversations (conversations with product_id is null)
    const { data: convos, error: convosError } = await adminClient
      .from("conversations")
      .select("*")
      .is("product_id", null)
      .order("updated_at", { ascending: false });

    if (convosError) {
      console.error("[Admin Support API] Error fetching conversations:", convosError);
      return NextResponse.json({ error: "Error al obtener conversaciones de soporte" }, { status: 500 });
    }

    const allMeta = getAllTicketMeta();

    // 3. Enrich conversations with user information, message history, and support status
    const supportTickets = await Promise.all(
      (convos || []).map(async (conv) => {
        // The user requesting support is the one who is NOT the admin
        const userId = conv.buyer_id === adminId ? conv.seller_id : conv.buyer_id;

        const { data: userData } = await adminClient
          .from("users")
          .select("id, full_name, company_name, email, phone, role, created_at")
          .eq("id", userId)
          .maybeSingle();

        // Fetch all messages in this support conversation
        const { data: messages } = await adminClient
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });

        // Unread messages from the user to admin
        const unreadCount = (messages || []).filter(
          (m) => m.sender_id !== adminId && !m.read_at
        ).length;

        const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;
        const meta = allMeta[conv.id] || getTicketMeta(conv.id);

        const userName = userData?.company_name || userData?.full_name || "Usuario de Agrilpa";

        return {
          id: conv.id,
          conversation_id: conv.id,
          userId: userId,
          user: {
            id: userId,
            name: userName,
            fullName: userData?.full_name || "Sin nombre registrado",
            companyName: userData?.company_name || "Particular",
            email: userData?.email || "Sin correo",
            phone: userData?.phone || "No especificado",
            role: userData?.role || "user",
            registeredAt: userData?.created_at,
          },
          status: meta.status || "open",
          priority: meta.priority || "medium",
          adminNotes: meta.adminNotes || "",
          unreadCount,
          lastMessage,
          messages: messages || [],
          createdAt: conv.created_at,
          updatedAt: conv.updated_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      tickets: supportTickets,
      adminId,
    });
  } catch (error) {
    console.error("[Admin Support API] Server error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
