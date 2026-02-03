
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // 1. Fetch User Purchases
        const { data: purchases, error } = await supabase
            .from("purchases")
            .select("id, price_usd, created_at, product_name")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true })

        if (error) throw error

        // 2. Fetch Active Products Count
        // We can use the existing API logic here or query directly if we assume 'products' table exists?
        // Given the previous file used an API call, let's try to be consistent or just use Supabase if RLS allows.
        // For now, let's keep it simple and just return null for products if we can't easily query it, the frontend handles it.
        // But actually, the frontend was calling /api/products/get-user-products. We can let the frontend keep doing that or aggregate here.
        // Let's focus on the CHARTS data (purchases).

        // 3. Process Monthly Sales (Spending)
        const monthlySales = Array(12).fill(0).map((_, i) => ({
            name: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i],
            ventas: 0
        }))

        // 4. Process Weekly Transactions (Last 4 weeks)
        // Helper to get week number relative to current date is complex.
        // Simpler: Group by "Week 1", "Week 2", etc. of the current month?
        // Or just "Last 4 Weeks".

        // Grouping logic...
        purchases?.forEach((p: any) => {
            const date = new Date(p.created_at)
            const month = date.getMonth()
            monthlySales[month].ventas += (p.price_usd || 0)
        })

        // Transactions per Week (Last 4 chunks of 7 days)
        const now = new Date()
        const weeks = [
            { name: "Sem 1", transacciones: 0, start: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000) },
            { name: "Sem 2", transacciones: 0, start: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) },
            { name: "Sem 3", transacciones: 0, start: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
            { name: "Sem 4", transacciones: 0, start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        ]

        purchases?.forEach((p: any) => {
            const date = new Date(p.created_at)
            // Check which bucket it falls into
            // This is a rough approximate for "Recent Activity" chart
            if (date >= weeks[0].start && date < weeks[1].start) weeks[0].transacciones++
            else if (date >= weeks[1].start && date < weeks[2].start) weeks[1].transacciones++
            else if (date >= weeks[2].start && date < weeks[3].start) weeks[2].transacciones++
            else if (date >= weeks[3].start) weeks[3].transacciones++
        })

        // Prepare Response
        const totalPurchases = purchases?.reduce((sum: number, p: any) => sum + (p.price_usd || 0), 0) || 0
        const countPurchases = purchases?.length || 0

        // Recent Activity (Top 5)
        // We reverse the array to get latest first since we ordered by ASC for charts
        const recentActivity = [...(purchases || [])].reverse().slice(0, 5).map((p: any) => ({
            action: `Compra: ${p.product_name}`,
            time: new Date(p.created_at).toLocaleDateString(),
            type: "success"
        }))

        return NextResponse.json({
            totalSales: totalPurchases, // Mapping spending to "Sales" visual slot
            monthlyData: monthlySales,
            weeklyData: weeks.map(w => ({ name: w.name, transacciones: w.transacciones })),
            recentActivity,
            totalTransactions: countPurchases
        })

    } catch (error: any) {
        console.error("Dashboard Stats Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
