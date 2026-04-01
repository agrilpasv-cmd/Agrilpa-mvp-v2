import { createAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      fullName,
      companyName,
      companyWebsite,
      address,
      state,
      phone,
      country,
      userType,
      product1,
      product2,
      product3,
      supplyCountry1,
      supplyCountry2,
      supplyCountry3,
      volumeRange,
      hasExportCertificates,
      providerCountry1,
      providerCountry2,
      providerCountry3
    } = await request.json()

    // Validar datos requeridos
    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Registrar usuario en Supabase Auth con email confirmado automáticamente
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: fullName,
        company_name: companyName,
        company_website: companyWebsite,
        user_type: userType,
        state: state,
        products_of_interest: [product1, product2, product3].filter(Boolean),
        supply_countries: [supplyCountry1, supplyCountry2, supplyCountry3].filter(Boolean),
        provider_countries: [providerCountry1, providerCountry2, providerCountry3].filter(Boolean),
        has_export_certificates: hasExportCertificates,
        annual_volume: volumeRange,
      },
    })

    if (authError) {
      console.error("[Agrilpa] Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 })
    }

    const isAdminEmail = email === "agrilpasv@gmail.com"
    const role = isAdminEmail ? "admin" : "user"

    const productsOfInterest = [product1, product2, product3].filter(Boolean)

    const { error: profileError } = await adminClient.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      company_name: companyName || null,
      company_website: companyWebsite || null,
      address: address || null,
      state: state || null,
      phone: phone || null,
      country: country || null,
      user_type: userType,
      role: role,
      products_of_interest: productsOfInterest,
      supply_countries: [supplyCountry1, supplyCountry2, supplyCountry3].filter(Boolean),
      provider_countries: [providerCountry1, providerCountry2, providerCountry3].filter(Boolean),
      has_export_certificates: hasExportCertificates === true,
      annual_volume: volumeRange || null,
    })

    if (profileError) {
      console.error("[Agrilpa] Profile creation error:", profileError)
      // Si falla la creación del perfil, eliminar usuario de auth usando admin client
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({
        error: `Error al crear el perfil: ${profileError.message} (${profileError.details || 'No details'})`
      }, { status: 500 })
    }

    // Enviar correo de bienvenida de forma asíncrona
    sendWelcomeEmail({
      recipientEmail: email,
      recipientName: fullName
    }).catch(err => console.error("[Email] Error asíncrono enviando correo de bienvenida:", err))

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error("[Agrilpa] Registration error:", error)
    return NextResponse.json({ error: "Error en el registro" }, { status: 500 })
  }
}
