import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmailVerification } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Use SITE_URL env var so email links always point to the deployed domain, never localhost
  const siteUrl = process.env.SITE_URL || request.headers.get("origin") || "http://localhost:3000"
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "El correo es requerido" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verify the user exists and is not yet confirmed
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: "Error al verificar el usuario" }, { status: 500 })
    }

    const user = listData?.users?.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "No existe una cuenta con ese correo" }, { status: 404 })
    }

    if (user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Este correo ya fue verificado. Puedes iniciar sesión normalmente." },
        { status: 400 }
      )
    }

    // Generate a fresh confirmation link via Supabase admin.
    // Extract hashed_token and build our OWN URL — avoids Supabase redirect whitelist issues.
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email,
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[Agrilpa] Error generating resend link:", linkError)
      return NextResponse.json({ error: "No se pudo generar el enlace de verificación" }, { status: 500 })
    }

    // Build our own verification URL: /auth/callback?token_hash=...&type=signup
    const tokenHash = linkData.properties.hashed_token
    const confirmationUrl = `${siteUrl}/auth/callback?token_hash=${tokenHash}&type=signup`

    // Send via Resend with Agrilpa branding (same as original registration email)
    const recipientName = name || user.user_metadata?.full_name || email.split("@")[0]
    const result = await sendEmailVerification({
      recipientEmail: email,
      recipientName,
      confirmationUrl,
    })

    if (!result.success) {
      console.error("[Agrilpa] Failed to resend verification email:", result.error)
      return NextResponse.json({ error: "No se pudo enviar el correo. Intenta de nuevo." }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Correo de verificación reenviado correctamente." })
  } catch (error) {
    console.error("[Agrilpa] Resend verification error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
