import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    },
                },
            },
        )

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await req.json()
        const { product_id, seller_id, purchase_id, rating, comment } = body

        if (!product_id || !seller_id || !purchase_id || !rating) {
            return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Calificación inválida" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Comprobar si ya existe una reseña para esta compra
        const { data: existingReview, error: checkError } = await supabaseAdmin
            .from('product_reviews')
            .select('id')
            .eq('purchase_id', purchase_id)
            .single()

        if (existingReview) {
            return NextResponse.json({ error: "Ya has calificado esta compra" }, { status: 400 })
        }

        // Insertar reseña
        const { data, error } = await supabaseAdmin
            .from('product_reviews')
            .insert({
                product_id,
                buyer_id: session.user.id,
                seller_id,
                purchase_id,
                rating,
                comment: comment || null
            })
            .select()
            .single()

        if (error) {
            console.error("[API/reviews/create] Insert error:", error)
            return NextResponse.json({ error: "Error al guardar la reseña" }, { status: 500 })
        }

        return NextResponse.json({ success: true, review: data }, { status: 200 })

    } catch (error: any) {
        console.error("[API/reviews/create] Catch error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
