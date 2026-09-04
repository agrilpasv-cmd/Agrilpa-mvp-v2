import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { handleChatMessageNotification, cancelPendingChatEmail } from "@/lib/chat-notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { conversationId, productId, buyerId, sellerId, content, senderId, attachmentUrl, attachmentType } = body;

    if ((!content && !attachmentUrl) || !senderId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Resolve conversation
    if (conversationId) {
      // If conversationId is provided, verify it belongs to this sender
      const { data: convData, error: convError } = await adminClient
        .from("conversations")
        .select("product_id, buyer_id, seller_id")
        .eq("id", conversationId)
        .single();
      
      if (!convError && convData) {
        // STRICT PARTICIPATION CHECK: Sender MUST be buyer or seller of this conversation
        if (convData.buyer_id !== senderId && convData.seller_id !== senderId) {
          console.warn(`[Security Alert] Sender ${senderId} attempted to use conversation ${conversationId} belonging to ${convData.buyer_id} and ${convData.seller_id}. Discarding stale conversationId.`);
          conversationId = null;
        } else {
          productId = convData.product_id;
          buyerId = convData.buyer_id;
          sellerId = convData.seller_id;
        }
      } else {
        conversationId = null;
      }
    }

    if (!conversationId) {
      if (buyerId && sellerId && (!productId || productId === 'support')) {
        // Support conversation between this specific user and support admin
        const { data: existingConvos } = await adminClient
          .from("conversations")
          .select("id")
          .is("product_id", null)
          .or(`and(buyer_id.eq.${buyerId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${buyerId})`)
          .limit(1);

        if (existingConvos && existingConvos.length > 0) {
          conversationId = existingConvos[0].id;
        } else {
          const { data: newConvo, error: insertConvError } = await adminClient
            .from("conversations")
            .insert({ product_id: null, buyer_id: buyerId, seller_id: sellerId })
            .select("id")
            .single();
          if (!insertConvError && newConvo) {
            conversationId = newConvo.id;
          }
        }
        productId = null;
      } else if (productId && buyerId && sellerId) {
        // Find existing conversation specifically for this product between these two users
        const { data: existingConvos } = await adminClient
          .from("conversations")
          .select("id")
          .eq("product_id", productId)
          .or(`and(buyer_id.eq.${buyerId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${buyerId})`)
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
    }

    if (!conversationId) {
      return NextResponse.json({ error: "No se pudo resolver la conversación" }, { status: 400 });
    }

    // 2. Insert the message
    const messageContent = content || (attachmentType === 'image' ? "📷 Foto adjunta" : "📎 Documento adjunto");
    const { data: newMessage, error: msgError } = await adminClient
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: messageContent,
        attachment_url: attachmentUrl || null,
        attachment_type: attachmentType || null,
      })
      .select("*")
      .single();

    if (msgError) {
      console.error("[Chat API] Error inserting message:", msgError);
      return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 });
    }

    // If the sender was waiting on an email notification for this conversation, cancel it because they just responded!
    cancelPendingChatEmail(conversationId, senderId);

    // 3. Process email notification with anti-spam presence check and 7-min debounce
    if (buyerId && sellerId) {
      const recipientId = senderId === buyerId ? sellerId : buyerId;
      
      const { data: recipientUser } = await adminClient.from("users").select("email, full_name, company_name, role").eq("id", recipientId).single();
      const { data: senderUser } = await adminClient.from("users").select("full_name, company_name, role").eq("id", senderId).single();

      let productName = "Soporte Agrilpa";
      if (productId) {
        const { data: productData } = await adminClient.from("user_products").select("title").eq("id", productId).single();
        productName = productData?.title || "un producto";
      }

      if (recipientUser?.email && senderUser) {
        const senderName = senderUser.role === 'admin'
          ? "Soporte Oficial Agrilpa"
          : (senderUser.company_name || senderUser.full_name || "Un usuario");
        const recipientName = recipientUser.company_name || recipientUser.full_name || "Usuario";

        handleChatMessageNotification({
          conversationId,
          recipientId,
          recipientEmail: recipientUser.email,
          recipientName,
          senderName,
          productName,
          content: messageContent,
        }).catch(err => console.error("[Email API] Error en cola de notificaciones de chat:", err));
      }
    }

    return NextResponse.json({ success: true, message: newMessage, conversationId });
  } catch (error) {
    console.error("[Chat API] Server error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
