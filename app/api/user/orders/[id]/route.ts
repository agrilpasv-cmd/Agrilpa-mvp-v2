import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        // Fetch specific purchase
        const { data: purchase, error } = await supabase
            .from("purchases")
            .select("*")
            .eq("id", id)
            .eq("user_id", session.user.id)
            .single()

        if (error) {
            console.error("Error fetching order details:", error)
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // Fetch image if it's a user product (UUID slug)
        // We use admin client to bypass RLS so buyer can see the image
        let productImage = null
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(purchase.product_slug)) {
            const supabaseAdmin = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                {
                    cookies: {
                        getAll() { return [] },
                        setAll() { }
                    }
                }
            )

            const { data: product } = await supabaseAdmin
                .from("user_products")
                .select("image")
                .eq("id", purchase.product_slug)
                .single()

            if (product) {
                productImage = product.image
            }
        }

        const enhancedOrder = {
            ...purchase,
            product_image: productImage
        }

        return NextResponse.json({ order: enhancedOrder }, { status: 200 })
    } catch (error) {
        console.error("Internal server error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
