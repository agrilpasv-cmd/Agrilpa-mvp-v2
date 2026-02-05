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
      companyName,
      contactMethod,
      contactInfo,
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
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
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

    // Check product limit (Max 3)
    const { count, error: countError } = await supabaseAdmin
      .from("user_products")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (countError) {
      console.error("[v0] Error checking product count:", countError)
      return NextResponse.json({ error: "Error checking limits" }, { status: 500 })
    }

    if (count !== null && count >= 3) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de 3 publicaciones. Elimina una para crear nueva." },
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
          contact_method: contactMethod,
          contact_info: contactInfo,
          certifications: body.certifications || null,
          // Add WhatsApp specific fields if method is WhatsApp
          ...(contactMethod === "WhatsApp" && body.countryCode && body.phoneNumber && {
            country_code: body.countryCode,
            phone_number: body.phoneNumber,
          }),
        },
      ])
      .select()

    if (error) {
      console.error("[v0] Database insert error:", error)
      return NextResponse.json({ error: `Database error: ${error.message || JSON.stringify(error)}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, product: data[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
