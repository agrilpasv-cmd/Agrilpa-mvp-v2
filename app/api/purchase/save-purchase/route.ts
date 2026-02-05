import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

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
        },
      ])
      .select()
    if (error) {
      console.error("[v0] Purchase save error:", error.message)
      return NextResponse.json({ error: "Error saving purchase" }, { status: 500 })
    }

    return NextResponse.json({ success: true, purchase }, { status: 200 })
  } catch (error) {
    console.error("[v0] Purchase API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
