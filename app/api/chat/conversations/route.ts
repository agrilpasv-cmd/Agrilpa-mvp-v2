import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Falta userId" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Fetch conversations for this user
    const { data: convos, error: convosError } = await adminClient
      .from("conversations")
      .select("*")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("updated_at", { ascending: false });

    if (convosError) {
      console.error("[Conversations API] Error fetching conversations:", convosError);
      return NextResponse.json({ error: "Error al obtener conversaciones" }, { status: 500 });
    }

    if (!convos || convos.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // 2. Fetch related products, users, last messages and unread counts in parallel
    const enrichedConversations = await Promise.all(
      convos.map(async (conv) => {
        const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;

        // Fetch other user info
        const { data: otherUserData } = await adminClient
          .from("users")
          .select("id, full_name, company_name, email, role")
          .eq("id", otherUserId)
          .maybeSingle();

        // Fetch product info
        const { data: productData } = await adminClient
          .from("user_products")
          .select("id, title, price, currency, unit, image, packaging, min_order")
          .eq("id", conv.product_id)
          .maybeSingle();

        // Fetch last message
        const { data: lastMsgData } = await adminClient
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Fetch unread count for current user
        const { count: unreadCount } = await adminClient
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", userId)
          .is("read_at", null);

        const isSupport = !conv.product_id || otherUserData?.role === 'admin';
        const otherName = isSupport && otherUserData?.role === 'admin'
          ? "Soporte Agrilpa"
          : (otherUserData?.company_name || otherUserData?.full_name || "Usuario de Agrilpa");

        return {
          id: conv.id,
          product_id: conv.product_id,
          buyer_id: conv.buyer_id,
          seller_id: conv.seller_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          unread_count: unreadCount || 0,
          is_support: Boolean(isSupport),
          other_user: {
            id: otherUserId,
            name: otherName,
            companyName: isSupport && otherUserData?.role === 'admin' ? "Equipo Oficial de Asistencia" : (otherUserData?.company_name || otherName),
            email: otherUserData?.email,
            isOnline: isSupport,
            lastSeen: isSupport ? "En línea" : "Recientemente"
          },
          product: productData ? {
            id: productData.id,
            title: productData.title,
            price: productData.price ? String(productData.price) : "Por Cotizar",
            currency: productData.currency || "$",
            image: productData.image || "/placeholder.svg",
            quantity: productData.unit || "kg"
          } : (isSupport ? {
            id: 'support',
            title: 'Soporte y Asistencia Agrilpa',
            price: 'Canal Oficial',
            currency: '',
            image: '/agrilpa-logo.svg',
            quantity: '24/7'
          } : undefined),
          last_message: lastMsgData || undefined
        };
      })
    );

    return NextResponse.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error("[Conversations API] Server error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
