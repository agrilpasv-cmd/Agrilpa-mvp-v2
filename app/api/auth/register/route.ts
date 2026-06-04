import { createAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"
import { sendEmailVerification } from "@/lib/email"

export async function POST(request: NextRequest) {
  // Use SITE_URL env var so email links always point to the deployed domain, never localhost
  const siteUrl = process.env.SITE_URL || request.headers.get("origin") || "http://localhost:3000"
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
      providerCountry3,
      howHeardAboutUs,
      howHeardOther
    } = await request.json()

    // Validar datos requeridos
    if (!email || !password || !fullName || !userType) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (!product1 && !product2 && !product3) {
      return NextResponse.json({ error: "Debe proveer al menos un producto de interés" }, { status: 400 })
    }

    // Validar que estado y dirección contengan letras o números (no solo puntos/símbolos)
    const alphanumericRegex = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/
    if (state && !alphanumericRegex.test(state)) {
      return NextResponse.json({ error: "El campo Estado debe contener letras o números" }, { status: 400 })
    }
    if (address && !alphanumericRegex.test(address)) {
      return NextResponse.json({ error: "La dirección debe contener letras o números" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verificar que el email no esté ya registrado
    const { data: existingUsers } = await adminClient.auth.admin.listUsers()
    const alreadyExists = existingUsers?.users?.some(u => u.email === email)
    if (alreadyExists) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 400 })
    }

    // Registrar usuario en Supabase Auth CON verificación de email obligatoria.
    // email_confirm: false → Supabase enviará un email de confirmación al usuario.
    // El usuario NO podrá iniciar sesión hasta hacer clic en el enlace de verificación.
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Requiere verificación real del correo
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
        how_heard_about_us: howHeardAboutUs,
        how_heard_other: howHeardOther,
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
      plan_type: 'gratis',
      how_heard_about_us: howHeardAboutUs || null,
      how_heard_other: howHeardOther || null
    })

    if (profileError) {
      console.error("[Agrilpa] Profile creation error:", profileError)
      // Si falla la creación del perfil, eliminar usuario de auth usando admin client
      await adminClient.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({
        error: `Error al crear el perfil: ${profileError.message} (${profileError.details || 'No details'})`
      }, { status: 500 })
    }

    // Generate the email confirmation link via Supabase Admin.
    // We extract the token_hash from the action_link and build our OWN verification URL
    // so we fully control where the user lands — no dependency on Supabase redirect whitelist.
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("[Agrilpa] Error generating confirmation link:", linkError)
      // Non-fatal: user was created, just warn
    } else {
      // Build our own verification URL: /auth/callback?token_hash=...&type=signup
      const tokenHash = linkData.properties.hashed_token
      const confirmationUrl = `${siteUrl}/auth/callback?token_hash=${tokenHash}&type=signup`

      // Send confirmation email via Resend with Agrilpa branding
      sendEmailVerification({
        recipientEmail: email,
        recipientName: fullName,
        confirmationUrl,
      }).catch(err => console.error("[Email] Error enviando email de verificacion:", err))
    }

    return NextResponse.json({
      success: true,
      requiresEmailVerification: true,
      message: "Registro exitoso. Revisa tu correo y haz clic en el enlace de verificación para activar tu cuenta.",
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
