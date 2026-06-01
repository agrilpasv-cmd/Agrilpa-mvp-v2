import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Fetch all quotations with seller and buyer information
        const { data: quotations, error } = await supabaseAdmin
            .from("quotations")
            .select(`
                *,
                seller:users!seller_id (company_name, full_name, email),
                buyer:users!buyer_id (company_name, full_name, email)
            `)
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

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const ids = searchParams.get("ids")

        if (!id && !ids) {
            return NextResponse.json({ error: "ID or IDs are required" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        let query = supabaseAdmin.from("quotations").delete()

        if (ids) {
            const idList = ids.split(",")
            query = query.in("id", idList)
        } else {
            query = query.eq("id", id)
        }

        const { error } = await query

        if (error) {
            console.error("Error deleting quotation(s):", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Admin Quotations DELETE] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
