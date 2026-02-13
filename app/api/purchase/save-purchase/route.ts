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

    // Insert purchase data
    const { data: purchase, error } = await supabase
      .from("purchases")
      .insert([
        {
          user_id: userId,
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
      console.error("[v0] Purchase save error:", error.message)
      return NextResponse.json({ error: "Error saving purchase" }, { status: 500 })
    }

    // Send email notification to the seller (fire-and-forget)
    // Send email notification to the seller (fire-and-forget)
    try {
      console.log("[Purchase] Attempting to notify seller for product:", data.productSlug)

      // Check if productSlug is a UUID (user product) or string (static product)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.productSlug)

      if (!isUUID) {
        console.log("[Purchase] Product slug is not a UUID (static product). Skipping seller email.")
      } else {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )
        // Look up product → vendor → email
        const { data: product, error: productError } = await supabaseAdmin
          .from("user_products")
          .select("vendor_id, name")
          .eq("id", data.productSlug)
          .single()

        if (productError) {
          console.error("[Purchase] Error fetching product for email:", productError.message)
        } else if (product?.vendor_id) {
          const { data: seller } = await supabaseAdmin
            .from("users")
            .select("email, full_name, company_name")
            .eq("id", product.vendor_id)
            .single()

          if (seller?.email) {
            console.log("[Purchase] Sending email to seller:", seller.email)
            sendPurchaseNotification({
              sellerEmail: seller.email,
              sellerName: seller.company_name || seller.full_name || "Vendedor",
              buyerName: data.fullName,
              productName: data.productName,
              quantity: data.quantityKg,
              price: data.priceUsd,
            }).catch(err => console.error("[Email] Background send failed:", err))
          } else {
            console.log("[Purchase] Seller has no email or not found")
          }
        } else {
          console.log("[Purchase] Product has no vendor_id")
        }
      }
    } catch (emailErr) {
      console.error("[Email] Error looking up seller for notification:", emailErr)
      // Don't fail the purchase if email fails
    }

    return NextResponse.json({ success: true, purchase }, { status: 200 })
  } catch (error) {
    console.error("[v0] Purchase API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
