import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

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

        // Get current user
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ notifications: { pedidos: 0, cotizaciones: 0, mensajes: 0 } }, { status: 200 })
        }

        // Count active orders (assuming 'Entregado' is the final state)
        // We count everything that is NOT 'Entregado' as an active notification/task
        const { count: activeOrdersCount, error: ordersError } = await supabase
            .from("purchases")
            .select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id)
            .neq("status", "Entregado") // Count only pending/active orders

        // For cotizaciones (Quotes), we don't have a table yet, so we return 0
        // For mensajes (Messages), we don't have a table either, return 0 for now

        // If you add tables later, add parallel queries here

        if (ordersError) {
            console.error("Error counting orders:", ordersError)
        }

        return NextResponse.json({
            notifications: {
                pedidos: activeOrdersCount || 0,
                cotizaciones: 0,
                mensajes: 0,
                // Add others as needed
            }
        }, { status: 200 })

    } catch (error) {
        console.error("Internal server error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
