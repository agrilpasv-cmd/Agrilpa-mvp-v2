import { createServerClient } from "@supabase/ssr"
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
        console.log("Sidebar (Refactored): User ID", userId)

        // 1. My Publications
        const { count: publicaciones } = await supabase
            .from("user_products")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)

        // 2. Orders/Purchases (purchases)
        // Debug raw count first
        const { count: rawTotal } = await supabase
            .from("purchases")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)

        console.log("Sidebar: Raw Total:", rawTotal)

        const { count: pedidos, error: pedidosError } = await supabase
            .from("purchases")
            .select("*", { count: 'exact', head: true })
            .eq("user_id", userId)
            .or('is_read.eq.false,is_read.is.null')

        if (pedidosError) {
            console.error("Sidebar: Orders Error", pedidosError)
        }
        console.log("Sidebar: Filtered Unread:", pedidos)

        // 3. Quotes (Placeholder)
        let cotizaciones = 0
        try {
            const { count, error } = await supabase
                .from("quotes")
                .select("*", { count: 'exact', head: true })
                .eq("user_id", userId)
            if (!error && count !== null) cotizaciones = count
        } catch (e) { }

        return NextResponse.json({
            publicaciones: publicaciones || 0,
            cotizaciones: cotizaciones,
            pedidos: pedidos || 0,
            logistica: 0,
            transacciones: 0,
            mensajes: 0
        })

    } catch (error) {
        console.error("Sidebar Counts Error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
