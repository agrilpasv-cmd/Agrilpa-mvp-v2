import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { sendPurchaseNotification } from "@/lib/email"

interface PurchaseData {
  productName: string
  productSlug: string
  quantityKg: number
  priceUsd: number
  fullName: string
  email: string
  countryCode: string
  phoneNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  shippingMethod: string
  paymentMethod: string
  specialInstructions?: string
  containerSize?: string
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const data: PurchaseData = await request.json()

    // Validate required fields
    if (!data.productName || !data.email || !data.fullName) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Get current user if authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Lookup seller ID before inserting
    let sellerId = null;
    let sellerEmail = null;
    let sellerNameStr = null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.productSlug)

    if (isUUID) {
      const { data: product } = await supabaseAdmin
        .from("user_products")
        .select("user_id, name")
        .eq("id", data.productSlug)
        .single()

      if (product?.user_id) {
        sellerId = product.user_id;
        const { data: seller } = await supabaseAdmin
          .from("users")
          .select("email, full_name, company_name")
          .eq("id", sellerId)
          .single()
        
        if (seller?.email) {
          sellerEmail = seller.email;
          sellerNameStr = seller.company_name || seller.full_name || "Vendedor";
        }
      }
    }

    // Insert purchase data
    const { data: purchase, error } = await supabaseAdmin
      .from("purchases")
      .insert([
        {
          user_id: userId,
          seller_id: sellerId,
          product_name: data.productName,
          product_slug: data.productSlug,
          quantity_kg: data.quantityKg,
          price_usd: data.priceUsd,
          full_name: data.fullName,
          email: data.email,
          country_code: data.countryCode,
          phone_number: data.phoneNumber,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          country: data.country,
          shipping_method: data.shippingMethod,
          payment_method: data.paymentMethod,
          special_instructions: data.specialInstructions || null,
          container_size: data.containerSize || null,
          is_read: false,
          status: "Pendiente",
          tracking: [
            {
              fecha: new Date().toISOString(),
              estado: "Orden Recibida",
              ubicacion: "Sistema Agrilpa"
            }
          ],
        },
      ])
      .select()
    if (error) {
      console.error("[Agrilpa] Purchase save error:", error.message)
      if (error.message.includes("column") && error.message.includes("seller_id")) {
         return NextResponse.json({
            error: "Falta la columna seller_id en la tabla purchases",
            sqlToRun: "ALTER TABLE purchases ADD COLUMN IF NOT EXISTS seller_id UUID; NOTIFY pgrst, 'reload schema';"
         }, { status: 500 })
      }
      return NextResponse.json({ error: "Error saving purchase" }, { status: 500 })
    }

    // Send email notification to the seller (fire-and-forget)
    try {
      if (sellerEmail && sellerNameStr) {
        console.log("[Purchase] Sending email to seller:", sellerEmail)
        sendPurchaseNotification({
          sellerEmail: sellerEmail,
          sellerName: sellerNameStr,
          buyerName: data.fullName,
          productName: data.productName,
          quantity: data.quantityKg,
          price: data.priceUsd,
        }).catch(err => console.error("[Email] Background send failed:", err))
      } else {
        console.log("[Purchase] No seller email found to notify.")
      }
    } catch (emailErr) {
      console.error("[Email] Error notifying seller:", emailErr)
    }

    return NextResponse.json({ success: true, purchase }, { status: 200 })
  } catch (error) {
    console.error("[Agrilpa] Purchase API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
