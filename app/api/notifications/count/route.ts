import { createServerClient } from "@supabase/ssr"
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
            return NextResponse.json({ count: 0 })
        }

        const userId = session.user.id

        // Count pending quotations where the user is the seller
        // This corresponds to what the user refers to as "notifications for publications"
        const { count, error } = await supabase
            .from("quotations")
            .select("*", { count: 'exact', head: true })
            .eq("seller_id", userId)
            .eq("status", "pending")

        if (error) {
            console.error("[Notifications API] Error fetching count:", error)
            return NextResponse.json({ count: 0 })
        }

        return NextResponse.json({ count: count || 0 })

    } catch (error) {
        console.error("Notifications Count API Error:", error)
        return NextResponse.json({ count: 0 })
    }
}
