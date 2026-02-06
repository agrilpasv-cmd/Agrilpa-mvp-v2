import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Fetch all quotations
        const { data: quotations, error } = await supabaseAdmin
            .from("quotations")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching admin quotations:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Aggregate statistics
        const stats = {
            total: quotations.length,
            pending: quotations.filter(q => q.status === 'pending').length,
            replied: quotations.filter(q => q.status === 'replied').length,
            rejected: quotations.filter(q => q.status === 'rejected').length,
            topProducts: {} as Record<string, { title: string, count: number }>
        }

        quotations.forEach(q => {
            if (q.product_id) {
                if (!stats.topProducts[q.product_id]) {
                    stats.topProducts[q.product_id] = { title: q.product_title || 'Producto desconocido', count: 0 }
                }
                stats.topProducts[q.product_id].count++
            }
        })

        // Sort top products
        const topProductsArray = Object.values(stats.topProducts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        return NextResponse.json({
            quotations,
            stats: {
                ...stats,
                topProducts: topProductsArray
            }
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                Pragma: "no-cache",
            }
        })

    } catch (error: any) {
        console.error("[Admin Quotations API] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
