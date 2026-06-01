import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    console.log("=== INCREMENT VIEWS API CALLED ===")

    try {
        const body = await request.json()
        console.log("Request body:", body)

        const { productId } = body

        if (!productId) {
            console.log("ERROR: No productId provided")
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
        }

        console.log("Product ID:", productId)
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("Service Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

        // Use service role key for direct database access (bypasses RLS)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Get current views
        console.log("Fetching current views...")
        const { data: product, error: fetchError } = await supabaseAdmin
            .from("user_products")
            .select("id, views")
            .eq("id", productId)
            .single()

        console.log("Fetch result:", { product, fetchError })

        if (fetchError) {
            console.error("Error fetching product views:", fetchError)
            return NextResponse.json({ error: "Product not found", details: fetchError.message }, { status: 404 })
        }

        const currentViews = product?.views || 0
        console.log("Current views:", currentViews)

        // Update with incremented value
        console.log("Updating views to:", currentViews + 1)
        const { data: updateData, error: updateError } = await supabaseAdmin
            .from("user_products")
            .update({ views: currentViews + 1 })
            .eq("id", productId)
            .select()

        console.log("Update result:", { updateData, updateError })

        if (updateError) {
            console.error("Error updating views:", updateError)
            return NextResponse.json({ error: "Failed to update views", details: updateError.message }, { status: 500 })
        }

        console.log(`SUCCESS: Views incremented for ${productId}: ${currentViews} -> ${currentViews + 1}`)

        return NextResponse.json({ success: true, views: currentViews + 1 })

    } catch (error) {
        console.error("EXCEPTION in increment-views:", error)
        return NextResponse.json({ error: "Internal Server Error", details: String(error) }, { status: 500 })
    }
}
