import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const FEATURED_SETTINGS_UUID = '11111111-1111-1111-1111-111111111111'

// Helper to verify admin permissions
async function verifyAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { authorized: false, errorResponse: NextResponse.json({ error: "No autorizado" }, { status: 401 }) }
  }

  const supabaseAdmin = createAdminClient()
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (userData?.role !== "admin") {
    return { authorized: false, errorResponse: NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 }) }
  }

  return { authorized: true, supabaseAdmin }
}

export async function GET() {
  try {
    const { authorized, supabaseAdmin, errorResponse } = await verifyAdmin()
    if (!authorized || !supabaseAdmin) return errorResponse!

    // Fetch the featured products configuration row
    const { data: row, error } = await supabaseAdmin
      .from("hero_images")
      .select("*")
      .eq("id", FEATURED_SETTINGS_UUID)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 is "Row not found"
      console.error("[API] Error fetching featured settings row:", error)
      return NextResponse.json({ error: "Error al leer configuración" }, { status: 500 })
    }

    const idsString = row?.link_url || ""
    const featuredProductIds = idsString ? idsString.split(",").filter(Boolean) : []

    return NextResponse.json({ featuredProductIds })
  } catch (err: any) {
    console.error("[API] GET featured products error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { authorized, supabaseAdmin, errorResponse } = await verifyAdmin()
    if (!authorized || !supabaseAdmin) return errorResponse!

    const { featuredProductIds } = await request.json()

    if (!Array.isArray(featuredProductIds)) {
      return NextResponse.json({ error: "Los datos deben ser un arreglo de IDs" }, { status: 400 })
    }

    if (featuredProductIds.length > 4) {
      return NextResponse.json({ error: "El límite es de 4 productos destacados" }, { status: 400 })
    }

    const joinedIds = featuredProductIds.join(",")

    // Check if the setting row exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from("hero_images")
      .select("id")
      .eq("id", FEATURED_SETTINGS_UUID)
      .single()

    if (findError && findError.code !== "PGRST116") {
      console.error("[API] Error verifying featured settings row existence:", findError)
      return NextResponse.json({ error: "Error de verificación" }, { status: 500 })
    }

    if (existing) {
      // Update
      const { error: updateError } = await supabaseAdmin
        .from("hero_images")
        .update({ link_url: joinedIds })
        .eq("id", FEATURED_SETTINGS_UUID)

      if (updateError) throw updateError
    } else {
      // Insert
      const { error: insertError } = await supabaseAdmin
        .from("hero_images")
        .insert([{
          id: FEATURED_SETTINGS_UUID,
          image_url: "",
          link_url: joinedIds,
          is_active: false,
          order_index: 9999
        }])

      if (insertError) throw insertError
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[API] PATCH featured products error:", err)
    return NextResponse.json({ error: err.message || "Error interno" }, { status: 500 })
  }
}
