import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Use Admin client to ensure we can fetch data even if RLS policies are tricky for now
        // Ideally we should rely on standard client + RLS, but for 'ventas' (seller view) we need to be sure.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Fetch Order
        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", id)
            .single()

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Verify ownership (either buyer or seller)
        if (order.seller_id !== userId && order.buyer_id !== userId) {
            // For now, if origin is 'quotation', buyer_id might be null or different if not linked to auth user yet.
            // But seller_id MUST match.
            return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 })
        }

        // Format data for frontend
        // The frontend expects: 
        // id, price_usd, price_bs, quantity_kg, product_name, product_image, full_name, etc.
        // We map from our 'orders' table schema.

        const formattedOrder = {
            id: order.id,
            price_usd: order.total_price || 0, // Map total_price to price_usd
            price_bs: 0, // specific formatting
            quantity_kg: order.quantity,
            product_name: order.product_name,
            product_slug: order.product_id, // using product_id as slug placeholder if slug not saved
            product_image: order.product_image,
            full_name: order.buyer_name,
            email: order.buyer_email,
            country_code: "58", // Default or extract if saved
            phone_number: order.buyer_phone ? order.buyer_phone.replace("+58", "").trim() : "",
            address: order.shipping_address,
            city: "N/A", // Not stored in simple order schema yet
            state: "N/A",
            zip_code: "N/A",
            country: "Venezuela", // Default
            payment_method: "A convenir",
            special_instructions: order.origin === 'quotation' ? "Via Cotización" : "",
            incoterm: "EXW", // Default
            status: order.status || "Pendiente",
            created_at: order.created_at,
            shipping_method: "A convenir"
        }

        return NextResponse.json({ order: formattedOrder })

    } catch (error) {
        console.error("Error fetching order detail:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
