import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { financing_type } = body

    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log(
      "[v0] API Route - Cookies received:",
      allCookies.map((c) => c.name),
    )

    const supabase = await createServerClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("[v0] API Route - Session status:", session ? "Active" : "Inactive")
    console.log("[v0] API Route - User ID:", session?.user?.id || "null")

    if (!session?.user) {
      console.log("[v0] API Route - Rejecting: No session found")
      return NextResponse.json({ error: "Debes iniciar sesión para enviar una solicitud" }, { status: 401 })
    }

    const user_id = session.user.id
    console.log("[v0] API Route - Processing request with user_id:", user_id)

    let insertError
    if (financing_type === "linea-credito") {
      const { error } = await supabase.from("linea_credito_applications").insert({
        user_id,
        business_name: body.business_name,
        annual_revenue: body.annual_revenue ? Number.parseFloat(body.annual_revenue) : null,
        years_in_business: body.years_in_business ? Number.parseInt(body.years_in_business) : null,
        primary_products: body.primary_products,
        requested_limit: body.requested_limit ? Number.parseFloat(body.requested_limit) : null,
      })
      insertError = error
    } else if (financing_type === "por-orden") {
      const { error } = await supabase.from("por_orden_applications").insert({
        user_id,
        business_name: body.business_name,
        buyer_name: body.buyer_name,
        product_description: body.product_description,
        order_amount: body.order_amount ? Number.parseFloat(body.order_amount) : null,
        order_payment_terms: body.order_payment_terms ? Number.parseInt(body.order_payment_terms) : null,
      })
      insertError = error
    } else if (financing_type === "prefinanciamiento") {
      const { error } = await supabase.from("prefinanciamiento_applications").insert({
        user_id,
        business_name: body.business_name,
        crop_type: body.crop_type,
        planting_date: body.planting_date,
        harvest_date: body.harvest_date,
        estimated_harvest_value: body.estimated_harvest_value ? Number.parseFloat(body.estimated_harvest_value) : null,
      })
      insertError = error
    } else {
      return NextResponse.json({ error: "Tipo de financiamiento inválido" }, { status: 400 })
    }

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      return NextResponse.json({ error: "Error al guardar la solicitud" }, { status: 400 })
    }

    return NextResponse.json({ message: "Solicitud enviada exitosamente" }, { status: 200 })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
