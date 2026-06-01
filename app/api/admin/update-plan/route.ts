import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const { userId, planType, months } = await request.json()

    if (!userId || !planType) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    if (!["gratis", "pro"].includes(planType)) {
      return NextResponse.json({ error: "Plan inválido. Usa 'gratis' o 'pro'" }, { status: 400 })
    }

    // Use service role — same pattern as other admin APIs in this project
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Calculate expiry date
    let planExpiresAt: string | null = null
    if (planType === "pro" && months && Number(months) > 0) {
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + Number(months))
      planExpiresAt = expiryDate.toISOString()
    }

    const updatePayload: Record<string, any> = {
      plan_type: planType,
      plan_expires_at: planType === "pro" ? planExpiresAt : null,
    }

    const { data: user, error: userError } = await adminClient
      .from("users")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      console.error("[Agrilpa] User not found for email notification:", userError)
    }

    const { error } = await adminClient
      .from("users")
      .update(updatePayload)
      .eq("id", userId)

    if (error) {
      console.error("[Agrilpa] Error updating plan:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send email if upgraded to Pro
    if (planType === "pro" && user?.email) {
      const { sendProMembershipEmail } = await import("@/lib/email")
      await sendProMembershipEmail({
        recipientEmail: user.email,
        recipientName: user.full_name || "Usuario",
        expiryDate: planExpiresAt,
      })
    }

    return NextResponse.json({ success: true, planType, planExpiresAt })
  } catch (error) {
    console.error("[Agrilpa] Error in update-plan API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
