import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
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

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({
                publicaciones: 0,
                cotizaciones: 0,
                pedidos: 0,
                logistica: 0,
                transacciones: 0,
                mensajes: 0
            })
        }

        const userId = session.user.id

        // Use Admin client to bypass RLS for counts
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // 1. My Publications
        const { count: publicaciones } = await supabaseAdmin
            .from("user_products")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)

        // 2. Purchases (Compras) - where I am the buyer
        const { count: compras } = await supabaseAdmin
            .from("orders")
            .select("*", { count: 'exact', head: true })
            .eq("buyer_id", userId)
            .eq("is_read_buyer", false)

        // 3. Sales (Ventas) - where I am the seller
        let ventas = 0
        try {
            const { data: sales } = await supabaseAdmin
                .from("orders")
                .select("status")
                .eq("seller_id", userId)

            // Count "pending" sales (persistent counter) instead of unread
            ventas = sales?.filter(o => o.status?.toLowerCase() === 'pending').length || 0
        } catch (e) {
            console.error("Sidebar: Sales Error", e)
        }

        // 4. Quotations (Cotizaciones) - received by me as seller
        let cotizaciones = 0
        try {
            const { data: quotes } = await supabaseAdmin
                .from("quotations")
                .select("status")
                .eq("seller_id", userId)

            // Count all PENDING requests using case-insensitive check
            cotizaciones = quotes?.filter(q => q.status?.toLowerCase() === 'pending').length || 0

        } catch (e) {
            console.error("Sidebar: Quotes Error", e)
        }

        return NextResponse.json({
            publicaciones: publicaciones || 0,
            cotizaciones: cotizaciones,
            pedidos: compras || 0,
            compras: compras || 0, // Purchases
            ventas: ventas || 0,   // Sales
            logistica: 0,
            transacciones: 0,
            mensajes: 0
        })

    } catch (error) {
        console.error("Sidebar Counts Error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
