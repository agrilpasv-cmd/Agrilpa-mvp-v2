import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const isUuid = (value: unknown) =>
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

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

        const clickRows = clicks || []
        const userIds = Array.from(new Set([
            ...clickRows.map((c) => c.user_id).filter(isUuid),
            ...clickRows.map((c) => c.seller_id).filter(isUuid),
        ]))

        let usersById: Record<string, any> = {}
        if (userIds.length > 0) {
            const { data: users, error: usersError } = await supabaseAdmin
                .from("users")
                .select("id, full_name, email, company_name, user_type")
                .in("id", userIds)

            if (usersError) {
                console.error("Error fetching users for contact clicks:", usersError)
            } else {
                usersById = Object.fromEntries((users || []).map((user) => [user.id, user]))
            }
        }

        const enrichedClicks = clickRows.map((click) => {
            const buyer = click.user_id ? usersById[click.user_id] : null
            const seller = click.seller_id ? usersById[click.seller_id] : null

            return {
                ...click,
                buyer_name: buyer?.full_name || null,
                buyer_email: buyer?.email || null,
                buyer_company: buyer?.company_name || null,
                buyer_type: buyer?.user_type || null,
                seller_name: seller?.full_name || null,
                seller_email: seller?.email || null,
                seller_company: seller?.company_name || null,
            }
        })

        // Aggregate statistics
        const stats = {
            total: enrichedClicks.length,
            whatsapp: enrichedClicks.filter(c => c.click_type?.toLowerCase().trim() === 'whatsapp').length,
            email: enrichedClicks.filter(c => c.click_type?.toLowerCase().trim() === 'email').length,
            telegram: enrichedClicks.filter(c => c.click_type?.toLowerCase().trim() === 'telegram').length,
            topProducts: {} as Record<string, { title: string, count: number }>,
            recentActivity: enrichedClicks.slice(0, 10)
        }

        console.log("[Admin API] Aggregated Stats:", {
            total: stats.total,
            wa: stats.whatsapp,
            em: stats.email,
            others: stats.total - (stats.whatsapp + stats.email + stats.telegram)
        })

        if (stats.total > 0) {
            console.log("[Admin API] Last 3 click types:", enrichedClicks.slice(0, 3).map(c => c.click_type))
        }

        enrichedClicks.forEach(c => {
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
            clicks: enrichedClicks,
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

        let query = supabaseAdmin.from("product_contact_clicks").delete()

        if (ids) {
            const idList = ids.split(",")
            query = query.in("id", idList)
        } else {
            query = query.eq("id", id)
        }

        const { error } = await query

        if (error) {
            console.error("Error deleting contact click(s):", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Admin Contact Clicks DELETE] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

