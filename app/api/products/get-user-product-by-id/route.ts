import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get("id")

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
        }

        // Use standard supabase-js client with Service Role Key for admin access
        // This ensures consistent RLS bypass for both fetching and updating
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
            .from("user_products")
            .select("*")
            .eq("id", productId)
            .single()

        if (error) {
            console.error("[v0] Database error fetching product:", error)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        if (!data) {
            console.log("[v0] Product not found for ID:", productId)
            return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        // Return data for immediate UI update
        return NextResponse.json({
            product: data
        }, { status: 200 })
    } catch (error) {
        console.error("[v0] API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
