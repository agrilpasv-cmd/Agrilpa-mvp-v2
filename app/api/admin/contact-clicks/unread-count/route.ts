import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // Count where is_read is false or null
        const { count, error } = await supabaseAdmin
            .from("product_contact_clicks")
            .select("id", { count: 'exact', head: true })
            .or('is_read.eq.false,is_read.is.null')

        if (error) {
            // Ignore error if column doesn't exist yet, return 0
            if (error.message.includes("column") && error.message.includes("does not exist")) {
                return NextResponse.json({ unreadCount: 0 })
            }
            console.error("Error fetching admin unread contact clicks count:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ unreadCount: count || 0 }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate",
                Pragma: "no-cache",
                Expires: "0"
            }
        })
    } catch (error: any) {
        console.error("[Admin Unread Count API] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
