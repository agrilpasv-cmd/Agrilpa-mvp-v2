import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const cookieStore = await cookies()
        // Use ANON key to ensure we are acting as the user and respecting RLS
        const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        })

        // Get current user session
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { data, error } = await supabase
            .from("user_products")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("[v0] Database fetch error:", error)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        if (data && data.length > 0) {
            console.log("[DEBUG] get-my-products first item:", {
                id: data[0].id,
                views: data[0].views
            })
        } else {
            console.log("[DEBUG] get-my-products: No products found")
        }

        return NextResponse.json({ products: data || [] }, { status: 200 })
    } catch (error) {
        console.error("[v0] API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
