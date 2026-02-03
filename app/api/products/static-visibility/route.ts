import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
            .from("static_products_visibility")
            .select("product_id, is_visible")

        if (error) {
            console.error("[API] Error fetching static visibility:", error)
            return NextResponse.json({ visibility: [] }, { status: 200 })
        }

        return NextResponse.json({ visibility: data || [] }, { status: 200 })
    } catch (error) {
        console.error("[API] Internal error:", error)
        return NextResponse.json({ visibility: [] }, { status: 200 })
    }
}
