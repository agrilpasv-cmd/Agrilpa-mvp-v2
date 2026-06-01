import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { ids } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No IDs provided" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        const { error } = await supabaseAdmin
            .from("product_contact_clicks")
            .update({ is_read: true })
            .in("id", ids)

        if (error) {
            // Ignore error if column doesn't exist yet, just mock success
            if (error.message.includes("column") && error.message.includes("does not exist")) {
                console.warn("Column is_read does not exist yet. Mocking success.")
                return NextResponse.json({ success: true, mocked: true })
            }
            console.error("Error marking contact clicks as read:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[Admin Mark Read API] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
