import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, source = "website" } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Este correo ya está suscrito" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([
        {
          email: email.toLowerCase(),
          source,
          subscribed_at: new Date().toISOString(),
          is_active: true,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error al guardar suscripción:", error)
      return NextResponse.json({ error: "Error al procesar la suscripción" }, { status: 500 })
    }

    return NextResponse.json({ message: "Suscripción exitosa", data }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error en /api/newsletter/subscribe:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data } = await supabase
      .from("subscriptions")
      .select("email, is_active")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    return NextResponse.json({
      subscribed: !!data && data.is_active,
    })
  } catch (error) {
    console.error("[v0] Error en GET /api/newsletter/subscribe:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
