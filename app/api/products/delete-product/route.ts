import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: "Falta el ID del producto" }, { status: 400 })
        }

        const cookieStore = await cookies()

        // Create a client to get the session (needs anon key or similar to parse cookies)
        const supabaseAuth = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        })

        // Get current user session
        const {
            data: { session },
        } = await supabaseAuth.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 })
        }

        // Use Service Role key to perform the actual database operations
        // This bypasses RLS, so we MUST manually verify ownership
        const supabaseAdmin = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        })

        // Verify product belongs to user
        const { data: product, error: fetchError } = await supabaseAdmin
            .from("user_products")
            .select("user_id")
            .eq("id", id)
            .single()

        if (fetchError || !product) {
            console.error("Error fetching product to delete:", fetchError)
            return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
        }

        if (product.user_id !== session.user.id) {
            return NextResponse.json({ error: "No tienes permiso para eliminar este producto" }, { status: 403 })
        }

        // Delete product
        const { error: deleteError } = await supabaseAdmin.from("user_products").delete().eq("id", id)

        if (deleteError) {
            console.error("[v0] Database delete error:", deleteError)
            return NextResponse.json({ error: `Error al eliminar: ${deleteError.message}` }, { status: 500 })
        }

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        console.error("[v0] API error:", error)
        return NextResponse.json({ error: `Error interno: ${error.message || "Error desconocido"}` }, { status: 500 })
    }
}
