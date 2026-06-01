import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await createServerClient()

        // Verify admin authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Use admin client to check role (bypasses RLS)
        const supabaseAdmin = createAdminClient()
        const { data: userData } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single()

        if (userData?.role !== "admin") {
            return NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 })
        }

        // Get all static product visibility settings
        const { data, error } = await supabaseAdmin
            .from("static_products_visibility")
            .select("*")
            .order("product_id", { ascending: true })

        if (error) {
            console.error("Error fetching static product visibility:", error)
            return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
        }

        return NextResponse.json({ visibility: data || [] })
    } catch (error) {
        console.error("Error in static product visibility GET:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createServerClient()

        // Verify admin authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Use admin client to check role (bypasses RLS)
        const supabaseAdmin = createAdminClient()
        const { data: userData } = await supabaseAdmin.from("users").select("role").eq("id", user.id).single()

        if (userData?.role !== "admin") {
            return NextResponse.json({ error: "Se requieren permisos de administrador" }, { status: 403 })
        }

        const { productId, isVisible } = await request.json()

        if (!productId || typeof isVisible !== "boolean") {
            return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
        }

        // Use admin client to update or insert visibility
        const { data, error } = await supabaseAdmin
            .from("static_products_visibility")
            .upsert(
                {
                    product_id: productId,
                    is_visible: isVisible,
                    updated_at: new Date().toISOString(),
                    updated_by: user.id,
                },
                {
                    onConflict: "product_id",
                },
            )
            .select()
            .single()

        if (error) {
            console.error("Error updating static product visibility:", error)
            return NextResponse.json({ error: "Error al actualizar visibilidad" }, { status: 500 })
        }

        return NextResponse.json({ success: true, visibility: data })
    } catch (error) {
        console.error("Error in static product visibility PATCH:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
