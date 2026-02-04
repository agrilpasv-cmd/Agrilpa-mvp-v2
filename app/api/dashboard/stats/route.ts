import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Use Admin client for counts
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Total Purchases (Mis Compras)
        const { data: purchases, error: purchasesError } = await supabaseAdmin
            .from("orders")
            .select("total_price, created_at")
            .eq("buyer_id", userId)

        const totalSales = purchases?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0
        const totalTransactions = purchases?.length || 0

        // 2. Active Quotations (Cotizaciones Pendientes)
        const { data: allQuotes, error: quoteError } = await supabaseAdmin
            .from("quotations")
            .select("status")
            .eq("seller_id", userId)

        const quotationsCount = allQuotes?.filter(q => q.status?.toLowerCase() === 'pending').length || 0

        console.log("[Stats API] User:", userId)
        console.log("[Stats API] Pending Quotes:", quotationsCount, "Total fetched:", allQuotes?.length, "Error:", quoteError)

        // 3. User Products
        const { count: activeProducts } = await supabaseAdmin
            .from("user_products")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)
            .eq("verified", true)

        // Demo data for charts
        const monthlyData = [
            { name: "Ene", ventas: 0 },
            { name: "Feb", ventas: 0 },
            { name: "Mar", ventas: 0 },
            { name: "Abr", ventas: 0 },
            { name: "May", ventas: 0 },
            { name: "Jun", ventas: 0 },
        ]

        return NextResponse.json({
            totalSales,
            totalTransactions,
            quotationsCount: quotationsCount || 0,
            activeProducts: activeProducts || 0,
            monthlyData,
            weeklyData: [],
            recentActivity: []
        })

    } catch (error) {
        console.error("Dashboard Stats Error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
