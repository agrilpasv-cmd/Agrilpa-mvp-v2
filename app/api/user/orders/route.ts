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
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch purchases for the user
        const { data: purchases, error } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })

        if (error) {
            console.error("Error fetching orders:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Fetch images for user products
        // Collect all product slugs that are UUIDs (user products)
        const userProductIds = purchases
            .map(p => p.product_slug)
            .filter(slug => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug))

        console.log("[API] User product IDs found:", userProductIds)

        let productImages: Record<string, string> = {}

        if (userProductIds.length > 0) {
            const { data: products, error: productsError } = await supabase
                .from("user_products")
                .select("id, image")
                .in("id", userProductIds)

            if (productsError) {
                console.error("[API] Error fetching user products:", productsError)
            }

            if (products) {
                console.log("[API] Products fetched:", products)
                products.forEach(p => {
                    productImages[p.id] = p.image
                })
            }
        }

        // Enhance purchases with image
        const enhancedPurchases = purchases.map(p => ({
            ...p,
            product_image: productImages[p.product_slug] || null
        }))

        return NextResponse.json({ orders: enhancedPurchases }, { status: 200 })
    } catch (error) {
        console.error("Internal server error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
