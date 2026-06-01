import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, countryCode, phoneNumber, company, country, userType, message } = body

    // Combine phone number
    const phone = countryCode && phoneNumber ? `+${countryCode} ${phoneNumber}` : null

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Los campos nombre, correo y mensaje son requeridos" }, { status: 400 })
    }

    const supabase = await createServerClient()
    
    // We also use a service role client just to guarantee the insert works regardless of RLS for anonymous users
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get current user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Insert into contact_submissions
    const { error } = await supabaseAdmin.from("contact_submissions").insert([
      {
        name,
        email,
        phone,
        company: company || null,
        country: country || null,
        user_type: userType || null,
        message,
        user_id: user?.id || null,
        is_registered: !!user,
      },
    ])

    if (error) {
      console.error("[Agrilpa] Contact submission error:", error)
      return NextResponse.json({ error: "Error al guardar el mensaje de contacto" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Mensaje enviado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("[Agrilpa] Contact submission error:", error)
    return NextResponse.json({ error: "Error al procesar el formulario" }, { status: 500 })
  }
}
