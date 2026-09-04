import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");
    const productId = searchParams.get("productId");

    if (!buyerId || !sellerId) {
      return NextResponse.json({ error: "Faltan parámetros buyerId o sellerId" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const isSupport = !productId || productId === "support" || productId === "null";

    let query = adminClient
      .from("conversations")
      .select("id, product_id, buyer_id, seller_id")
      .or(`and(buyer_id.eq.${buyerId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${buyerId})`);

    if (isSupport) {
      query = query.is("product_id", null);
    } else {
      query = query.eq("product_id", productId);
    }

    const { data: conv, error } = await query.maybeSingle();

    if (error) {
      console.error("[Resolve Conversation API] Error:", error);
      return NextResponse.json({ error: "Error al resolver la conversación" }, { status: 500 });
    }

    let messages: any[] = [];
    if (conv?.id) {
      const { data: msgData } = await adminClient
        .from("messages")
        .select("id, content, sender_id, attachment_url, attachment_type, read_at, created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
      messages = msgData || [];
    }

    return NextResponse.json({
      success: true,
      conversationId: conv?.id || null,
      messages,
    });
  } catch (err) {
    console.error("[Resolve Conversation API] Server error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
