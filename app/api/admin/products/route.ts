import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Create admin client that completely bypasses RLS
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        // 1. Fetch ALL products raw (no joins that might filter results)
        const { data: products, error: productsError } = await supabaseAdmin
            .from("user_products")
            .select("*")
            .order("created_at", { ascending: false })

        if (productsError) {
            console.error("[v0] Admin Products API error (fetching products):", productsError)
            return NextResponse.json({ error: productsError.message }, { status: 500 })
        }

        // 2. Fetch ALL user profiles
        const { data: users, error: usersError } = await supabaseAdmin
            .from("users")
            .select("id, full_name, email, company_name")

        if (usersError) {
            console.error("[v0] Error fetching users for mapping:", usersError)
            // We continue even if users fetch fails, to at least show the products
        }

        // 3. Manual Merge in memory
        // This ensures we show the product even if the user is missing
        const joinedData = products?.map(product => {
            const user = users?.find(u => u.id === product.user_id)
            return {
                ...product,
                user: user ? {
                    full_name: user.full_name,
                    email: user.email,
                    company_name: user.company_name
                } : null
            }
        })

        return NextResponse.json(joinedData || [], {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        })
    } catch (error: any) {
        console.error("[v0] Admin Products API unexpected error:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
