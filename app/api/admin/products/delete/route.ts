import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
        }

        // Create admin client
        const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        })

        const { error } = await supabaseAdmin.from("user_products").delete().eq("id", id)

        if (error) {
            console.error("[v0] Admin Delete Product Error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[v0] Admin Delete Product unexpected error:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
