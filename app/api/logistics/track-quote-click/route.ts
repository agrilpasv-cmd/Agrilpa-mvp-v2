import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, user_id } = await request.json()

    const supabase = await createServerClient()

    const { error } = await supabase.from("logistics_quote_clicks").insert({
      user_id: user_id || "00000000-0000-0000-0000-000000000000",
      email: email || null,
      user_agent: request.headers.get("user-agent"),
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    })

    if (error) {
      console.log("[v0] Logistics quote click tracking error:", error.message)
      return Response.json({ success: false, error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.log("[v0] Logistics quote click error:", error)
    return Response.json({ success: false, error: "Error al registrar click" }, { status: 500 })
  }
}
