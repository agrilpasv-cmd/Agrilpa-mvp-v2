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

        // 1. Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const userId = session.user.id

        // 2. Fetch orders using Admin client to bypass RLS, focusing on seller_id
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        const { data: orders, error: ordersError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("seller_id", userId)
            .order("created_at", { ascending: false })

        if (ordersError) {
            console.error("[API/seller/orders] Error fetching orders:", ordersError)

            // If the table doesn't exist yet, return empty for now
            if (ordersError.message.includes("relation \"orders\" does not exist")) {
                console.warn("Orders table not yet created.")
                return NextResponse.json({ orders: [] }, { status: 200 })
            }

            return NextResponse.json({ error: ordersError.message }, { status: 500 })
        }

        return NextResponse.json({ orders: orders || [] }, { status: 200 })

    } catch (error: any) {
        console.error("[API/seller/orders] Catch error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
