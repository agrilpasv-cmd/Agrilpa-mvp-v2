import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { sendChatNotificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { conversationId, productId, buyerId, sellerId, content, senderId } = body;

    if (!content || !senderId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Resolve conversation
    if (conversationId) {
      // If conversationId is provided, fetch missing details
      const { data: convData, error: convError } = await adminClient
        .from("conversations")
        .select("product_id, buyer_id, seller_id")
        .eq("id", conversationId)
        .single();
      
      if (!convError && convData) {
        productId = convData.product_id;
        buyerId = convData.buyer_id;
        sellerId = convData.seller_id;
      }
    } else if (productId && buyerId && sellerId) {
      // Find or create
      const { data: existingConvos, error: convError } = await adminClient
        .from("conversations")
        .select("id")
        .eq("product_id", productId)
        .eq("buyer_id", buyerId)
        .eq("seller_id", sellerId)
        .limit(1);

      if (existingConvos && existingConvos.length > 0) {
        conversationId = existingConvos[0].id;
      } else {
        const { data: newConvo, error: insertConvError } = await adminClient
          .from("conversations")
          .insert({ product_id: productId, buyer_id: buyerId, seller_id: sellerId })
          .select("id")
          .single();
        if (!insertConvError && newConvo) {
          conversationId = newConvo.id;
        }
      }
    }

    if (!conversationId) {
      return NextResponse.json({ error: "No se pudo resolver la conversación" }, { status: 400 });
    }

    // 2. Insert the message
    const { data: newMessage, error: msgError } = await adminClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
      })
      .select("*")
      .single();

    if (msgError) {
      console.error("[Chat API] Error inserting message:", msgError);
      return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 });
    }

    // 3. Send email notification
    if (buyerId && sellerId && productId) {
      const recipientId = senderId === buyerId ? sellerId : buyerId;
      
      const { data: recipientUser } = await adminClient.from("users").select("email, full_name, company_name").eq("id", recipientId).single();
      const { data: senderUser } = await adminClient.from("users").select("full_name, company_name").eq("id", senderId).single();
      const { data: productData } = await adminClient.from("user_products").select("title").eq("id", productId).single();

      if (recipientUser?.email && senderUser) {
        const senderName = senderUser.company_name || senderUser.full_name || "Un usuario";
        const recipientName = recipientUser.company_name || recipientUser.full_name || "Usuario";
        const productName = productData?.title || "un producto";

        await sendChatNotificationEmail({
          recipientEmail: recipientUser.email,
          recipientName: recipientName,
          senderName: senderName,
          productName: productName
        }).catch(err => console.error("[Email API] Error enviando notificacion de chat:", err));
      }
    }

    return NextResponse.json({ success: true, message: newMessage, conversationId });
  } catch (error) {
    console.error("[Chat API] Server error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
