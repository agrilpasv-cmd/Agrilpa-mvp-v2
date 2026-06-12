import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // Create admin client to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // 1. Fetch Users Count & Breakdown
        const { data: profiles, error: usersError } = await supabaseAdmin
            .from("users")
            .select("id, created_at, plan_type, user_type")

        // If users table fails, try auth users as fallback for count
        let usersData = profiles || []
        if (usersError) {
            console.error("Error fetching users table:", usersError)
            // Fallback: list auth users
            const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
            if (!authError && authUsers) {
                usersData = authUsers.map(u => ({ id: u.id, created_at: u.created_at }))
            }
        }

        const totalUsers = usersData.length

        // Calculate monthly registrations for the chart (last 6 months)
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        const currentMonth = new Date().getMonth()

        // Initialize last 6 months buckets
        const chartData: { name: string; monthIdx: number; year: number; usuarios: number }[] = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(currentMonth - i)
            const monthIdx = d.getMonth()
            chartData.push({
                name: months[monthIdx],
                monthIdx: monthIdx,
                year: d.getFullYear(),
                usuarios: 0
            })
        }

        usersData.forEach((user: any) => {
            const date = new Date(user.created_at)
            const m = date.getMonth()
            const y = date.getFullYear()

            const bucket = chartData.find(b => b.monthIdx === m && b.year === y)
            if (bucket) {
                bucket.usuarios++
            }
        })

        // Clean up chart data for frontend
        const monthlyData = chartData.map(({ name, usuarios }) => ({ name, usuarios }))

        // 1b. Plan Breakdown
        const proUsers = usersData.filter((u: any) => u.plan_type === 'pro').length
        const freeUsers = totalUsers - proUsers

        // User type breakdown (role comprador / vendedor / industrial)
        const compradorUsers = usersData.filter((u: any) => u.user_type === 'comprador').length
        const vendedorUsers = usersData.filter((u: any) => u.user_type === 'vendedor').length
        const industrialUsers = usersData.filter((u: any) => u.user_type === 'empresa').length

        // 2. Fetch Subscriptions Count
        const { count: subscriptionsCount, error: subsError } = await supabaseAdmin
            .from("subscriptions")
            .select("*", { count: 'exact', head: true })

        // 3. Admin Count (Estimation based on our knowledge or metadata if available)
        // For now we'll fetch roles if possible, or just assume distinct role management
        // We already have enriched profiles in users endpoint, but for speed just count
        // If we want accurate admin count we need to check roles. 
        // Let's assume admins are in the 'users' table with a role column as per admin/page.tsx logic
        // But since we selected only id/created_at, let's re-select if we can, or just skip strict admin count for speed
        // Actually, let's try to get role.
        const { data: admins, error: adminError } = await supabaseAdmin
            .from("users")
            .select("id")
            .eq("role", "admin")

        const adminUsers = admins?.length || 0
        const regularUsers = totalUsers - adminUsers
        const adminIds = (admins || []).map((a: any) => a.id)

        // 3b. Count quotations excluding those sent/received by admins
        let totalQuotations = 0
        try {
            let query = supabaseAdmin
                .from("quotations")
                .select("id", { count: 'exact', head: true })
            if (adminIds.length > 0) {
                query = query.not("buyer_id", "in", `(${adminIds.join(",")})`)
            }
            const { count } = await query
            totalQuotations = count || 0
        } catch (e) {
            console.error("[Stats API] Error counting quotations:", e)
        }

        // 4. Analytics Data - (Disabled to reduce database load)
        const detailedAnalytics = {
            summary: {
                visitors: 0,
                pageViews: 0,
                bounceRate: "0%",
                activeUsers: { total: 0, registered: 0, guests: 0 },
            },
            trend: [],
            topPages: [],
            topReferrers: [],
            topCountries: [],
            topOS: [],
            topDevices: []
        }

        // Calculate daily active users for today (in local server time or UTC, last 30 days of activities)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        let activeRegisteredToday = 0
        let activeGuestsToday = 0
        let activeUsersToday = 0
        let last7DaysActive: { date: string; registered: number; guests: number; total: number }[] = []

        try {
            const { data: activityRows, error: activityError } = await supabaseAdmin
                .from("user_activities")
                .select("user_id, ip_address, user_agent, created_at")
                .gte("created_at", thirtyDaysAgo.toISOString())

            const dailyActiveMap: Record<string, { registered: Set<string>, guests: Set<string> }> = {}

            if (!activityError && activityRows) {
                activityRows.forEach((row: any) => {
                    const dateStr = new Date(row.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    if (!dailyActiveMap[dateStr]) {
                        dailyActiveMap[dateStr] = { registered: new Set(), guests: new Set() }
                    }

                    if (row.user_id) {
                        dailyActiveMap[dateStr].registered.add(row.user_id)
                    } else {
                        const guestId = row.ip_address || (row.user_agent || "")
                        if (guestId) {
                            dailyActiveMap[dateStr].guests.add(guestId)
                        }
                    }
                })
            }

            // Get today's key in 'es-ES' format
            const todayStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
            const todayData = dailyActiveMap[todayStr] || { registered: new Set(), guests: new Set() }
            
            activeRegisteredToday = todayData.registered.size
            activeGuestsToday = todayData.guests.size
            activeUsersToday = activeRegisteredToday + activeGuestsToday

            // Build list of last 7 days of daily active users for display
            for (let i = 6; i >= 0; i--) {
                const d = new Date()
                d.setDate(d.getDate() - i)
                const dStr = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                const dayData = dailyActiveMap[dStr] || { registered: new Set(), guests: new Set() }
                last7DaysActive.push({
                    date: dStr,
                    registered: dayData.registered.size,
                    guests: dayData.guests.size,
                    total: dayData.registered.size + dayData.guests.size
                })
            }
        } catch (e) {
            console.error("[Stats API] Error fetching user activities:", e)
        }

        return NextResponse.json({
            totalUsers,
            totalSubscriptions: subscriptionsCount || 0,
            adminUsers,
            regularUsers,
            proUsers,
            freeUsers,
            totalQuotations,
            monthlyData,
            analyticsData: detailedAnalytics.topCountries, // Keeping legacy prop for safety
            detailedAnalytics, // New Full Data
            databaseStatus: "Activa",
            compradorUsers,
            vendedorUsers,
            industrialUsers,
            activeRegisteredToday,
            activeGuestsToday,
            activeUsersToday,
            last7DaysActive
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                Pragma: "no-cache",
            }
        })

    } catch (error: any) {
        console.error("[Stats API] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
