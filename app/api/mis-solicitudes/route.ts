import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAuthUser(request: Request) {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader) return null

  const token = authHeader.replace("Bearer ", "")
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error } = await supabaseClient.auth.getUser()
  if (error || !user) return null
  return user
}

// GET — List user's own purchase requests
export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Get user's Pro status
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("plan_type, plan_expires_at")
      .eq("id", user.id)
      .single()

    let isPro = false
    if (profile?.plan_type === "pro") {
      if (profile.plan_expires_at) {
        isPro = new Date(profile.plan_expires_at) > new Date()
      } else {
        isPro = true
      }
    }

    const maxRequests = isPro ? 5 : 1

    // Fetch user's requests
    const { data: requests, error } = await supabaseAdmin
      .from("purchase_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API] Error fetching user requests:", error)
      return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 })
    }

    // Count only active ones for limit check
    const now = new Date()
    const activeCount = (requests || []).filter(
      (r: any) => r.status === "active" && new Date(r.expires_at) > now
    ).length

    return NextResponse.json({
      requests: requests || [],
      is_pro: isPro,
      max_requests: maxRequests,
      active_count: activeCount,
      can_create: activeCount < maxRequests,
    })
  } catch (error) {
    console.error("[API] mis-solicitudes GET error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PUT — Update a purchase request
export async function PUT(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const requestId = formData.get("requestId") as string

    if (!requestId) {
      return NextResponse.json({ error: "ID de solicitud requerido" }, { status: 400 })
    }

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from("purchase_requests")
      .select("user_id")
      .eq("id", requestId)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Get emoji from form
    const emoji = formData.get("emoji") as string || null

    // Build update object
    const updateData: any = {
      product_name: formData.get("productName") as string,
      category: formData.get("category") as string,
      quantity: formData.get("quantity") as string,
      unit: formData.get("unit") as string || "kg",
      desired_date: formData.get("desiredDate") as string || null,
      country: formData.get("country") as string || null,
      delivery_state: formData.get("deliveryState") as string || null,
      delivery_address: formData.get("deliveryAddress") as string || null,
      description: formData.get("description") as string || null,
      budget: formData.get("budget") as string || null,
      specs: formData.get("specs") as string || null,
      source_type: formData.get("sourceType") as string || "cualquiera",
      contact_method: formData.get("contactMethod") as string || "email",
      contact_value: formData.get("contactValue") as string || null,
      image_url: emoji || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from("purchase_requests")
      .update(updateData)
      .eq("id", requestId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[API] Error updating request:", error)
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
    }

    return NextResponse.json({ success: true, request: data })
  } catch (error) {
    console.error("[API] mis-solicitudes PUT error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// DELETE — Delete a purchase request
export async function DELETE(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("id")

    if (!requestId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("purchase_requests")
      .delete()
      .eq("id", requestId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[API] Error deleting request:", error)
      return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] mis-solicitudes DELETE error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
