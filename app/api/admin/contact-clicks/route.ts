import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Fetch all contact clicks
        const { data: clicks, error } = await supabaseAdmin
            .from("product_contact_clicks")
            .select("*")
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching admin contact clicks:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Aggregate statistics
        const stats = {
            total: clicks.length,
            whatsapp: clicks.filter(c => c.click_type?.toLowerCase().trim() === 'whatsapp').length,
            email: clicks.filter(c => c.click_type?.toLowerCase().trim() === 'email').length,
            telegram: clicks.filter(c => c.click_type?.toLowerCase().trim() === 'telegram').length,
            topProducts: {} as Record<string, { title: string, count: number }>,
            recentActivity: clicks.slice(0, 10)
        }

        console.log("[Admin API] Aggregated Stats:", {
            total: stats.total,
            wa: stats.whatsapp,
            em: stats.email,
            others: stats.total - (stats.whatsapp + stats.email + stats.telegram)
        })

        if (stats.total > 0) {
            console.log("[Admin API] Last 3 click types:", clicks.slice(0, 3).map(c => c.click_type))
        }

        clicks.forEach(c => {
            if (c.product_id) {
                if (!stats.topProducts[c.product_id]) {
                    stats.topProducts[c.product_id] = { title: c.product_title || 'Producto desconocido', count: 0 }
                }
                stats.topProducts[c.product_id].count++
            }
        })

        // Sort top products
        const topProductsArray = Object.values(stats.topProducts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        return NextResponse.json({
            clicks,
            stats: {
                ...stats,
                topProducts: topProductsArray
            }
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                Pragma: "no-cache",
                Expires: "0"
            }
        })

    } catch (error: any) {
        console.error("[Admin Contact Clicks API] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
