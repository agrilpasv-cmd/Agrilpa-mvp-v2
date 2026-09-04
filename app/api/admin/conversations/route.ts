import { createAdminClient } from "@/lib/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { isConversationSeenByAdmin } from "@/lib/admin-chat-seen-state";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // 1. Fetch all conversations from Supabase
    const { data: convos, error: convosError } = await adminClient
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (convosError) {
      console.error("[Admin Conversations API] Error:", convosError);
      return NextResponse.json({ error: "Error al obtener conversaciones" }, { status: 500 });
    }

    if (!convos || convos.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // 2. Enrich all conversations with buyer, seller, product, and full message history
    const enriched = await Promise.all(
      convos.map(async (conv) => {
        // Buyer details
        const { data: buyerData } = await adminClient
          .from("users")
          .select("id, full_name, company_name, email, phone, role, created_at")
          .eq("id", conv.buyer_id)
          .maybeSingle();

        // Seller details
        const { data: sellerData } = await adminClient
          .from("users")
          .select("id, full_name, company_name, email, phone, role, created_at")
          .eq("id", conv.seller_id)
          .maybeSingle();

        // Product details (if not a support conversation)
        let productData: any = null;
        if (conv.product_id) {
          const { data: p } = await adminClient
            .from("user_products")
            .select("id, title, price, currency, unit, image, packaging, min_order")
            .eq("id", conv.product_id)
            .maybeSingle();
          productData = p;
        }

        // Messages in this conversation
        const { data: messages } = await adminClient
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true });

        const lastMessage = messages && messages.length > 0 ? messages[messages.length - 1] : null;

        const isSupport = !conv.product_id;
        const convCode = `CHAT-${conv.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
        const buyerCode = `USR-${conv.buyer_id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
        const sellerCode = `USR-${conv.seller_id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

        return {
          id: conv.id,
          code: convCode,
          product_id: conv.product_id,
          buyer_id: conv.buyer_id,
          seller_id: conv.seller_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          is_support: isSupport,
          is_seen: isConversationSeenByAdmin(conv.id, conv.updated_at),
          messages_count: messages?.length || 0,
          last_message: lastMessage,
          messages: messages || [],
          buyer: buyerData ? {
            id: buyerData.id,
            code: buyerCode,
            name: buyerData.company_name || buyerData.full_name || "Comprador",
            fullName: buyerData.full_name || "Sin nombre",
            companyName: buyerData.company_name || "Particular",
            email: buyerData.email || "",
            phone: buyerData.phone || "",
            role: buyerData.role || "user",
          } : {
            id: conv.buyer_id,
            code: buyerCode,
            name: "Usuario no encontrado",
            fullName: "Usuario no encontrado",
            companyName: "N/A",
            email: "",
            phone: "",
            role: "user",
          },
          seller: sellerData ? {
            id: sellerData.id,
            code: sellerCode,
            name: sellerData.role === "admin" ? "Soporte Agrilpa" : (sellerData.company_name || sellerData.full_name || "Vendedor"),
            fullName: sellerData.full_name || "Sin nombre",
            companyName: sellerData.company_name || "Particular",
            email: sellerData.email || "",
            phone: sellerData.phone || "",
            role: sellerData.role || "user",
          } : {
            id: conv.seller_id,
            code: sellerCode,
            name: "Usuario no encontrado",
            fullName: "Usuario no encontrado",
            companyName: "N/A",
            email: "",
            phone: "",
            role: "user",
          },
          product: productData ? {
            id: productData.id,
            title: productData.title,
            price: productData.price ? String(productData.price) : "Por Cotizar",
            currency: productData.currency || "$",
            image: productData.image || "/placeholder.svg",
            unit: productData.unit || "kg",
            packaging: productData.packaging,
            minOrder: productData.min_order,
          } : (isSupport ? {
            id: "support",
            title: "Soporte y Asistencia Técnica",
            price: "Oficial",
            currency: "",
            image: "/agrilpa-logo.svg",
            unit: "24/7",
          } : null),
        };
      })
    );

    return NextResponse.json({
      success: true,
      conversations: enriched,
      total: enriched.length,
    });
  } catch (error) {
    console.error("[Admin Conversations API] Server error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
