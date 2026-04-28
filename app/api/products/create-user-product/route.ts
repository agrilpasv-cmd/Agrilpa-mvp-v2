import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // We use a direct Supabase client with Service Role Key to bypass RLS for insertion
    // The user authentication is verified via the frontend session, but the DB write needs admin privileges due to strict RLS
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const {
      userId,
      title,
      category,
      price,
      quantity,
      description,
      country,
      minOrder,
      maturity,
      packaging,
      packagingSize,
      image,
      image2,
      image3,
      companyName,
      contactMethod,
      contactInfo,
      shippingUnitType,
      containerSize,
    } = body

    if (
      !userId ||
      !title ||
      !category ||
      !price ||
      !quantity ||
      !description ||
      !country ||
      !minOrder ||
      !packaging ||
      !packagingSize ||
      !companyName ||
      !contactMethod
    ) {
    }

    if (description.length < 50) {
      return NextResponse.json({ error: "La descripción del producto debe tener al menos 50 caracteres." }, { status: 400 })
    }

    // Validate contact information based on method
    if (contactMethod === "WhatsApp") {
      if (!body.countryCode || !body.phoneNumber) {
        return NextResponse.json({ error: "Missing WhatsApp contact information (country code and phone number required)" }, { status: 400 })
      }
    } else {
      if (!contactInfo) {
        return NextResponse.json({ error: "Missing contact information" }, { status: 400 })
      }
    }

    // Check product limit based on user plan
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("plan_type")
      .eq("id", userId)
      .single()

    const isPro = userProfile?.plan_type === "pro"
    const productLimit = isPro ? 10 : 3

    const { count, error: countError } = await supabaseAdmin
      .from("user_products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (countError) {
      console.error("[Agrilpa] Error checking product count:", countError)
      return NextResponse.json({ error: "Error checking limits" }, { status: 500 })
    }

    if (count !== null && count >= productLimit) {
      const planLabel = isPro ? "Pro (10 publicaciones)" : "Gratis (3 publicaciones)"
      return NextResponse.json(
        { error: `Has alcanzado el límite de tu plan ${planLabel}. ${isPro ? "Elimina una publicación para crear una nueva." : "Actualiza a Pro para publicar hasta 10 productos."}` },
        { status: 403 }
      )
    }

    // Combine contact info into description since we might not have specific columns
    const incoterm = body.incoterm || "A definir con el comprador"
    const fullDescription = `${description}\n\n---\nInformación del Vendedor:\nEmpresa: ${companyName}\nContacto: ${contactMethod}\nIncoterm: ${incoterm}`

    const { data, error } = await supabaseAdmin
      .from("user_products")
      .insert([
        {
          user_id: userId,
          title,
          category,
          price,
          quantity,
          description: fullDescription,
          country,
          min_order: minOrder,
          maturity: maturity || null,
          packaging,
          packaging_size: packagingSize,
          image: image || null,
          image2: image2 || null,
          image3: image3 || null,
          contact_method: contactMethod,
          contact_info: contactInfo,
          certifications: body.certifications || null,
          shipping_unit_type: shippingUnitType || null,
          container_size: containerSize || null,
          // Add WhatsApp specific fields if method is WhatsApp
          ...(contactMethod === "WhatsApp" && body.countryCode && body.phoneNumber && {
            country_code: body.countryCode,
            phone_number: body.phoneNumber,
          }),
        },
      ])
      .select()

    if (error) {
      console.error("[Agrilpa] Database insert error:", error)
      return NextResponse.json({ error: `Database error: ${error.message || JSON.stringify(error)}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[Agrilpa] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
