import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { quotationId } = await request.json()

        if (!quotationId) {
            return NextResponse.json({ error: "Quotation ID is required" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        const { error } = await supabaseAdmin
            .from("quotations")
            .update({ is_read: true })
            .eq("id", quotationId)

        if (error) {
            console.error("Error marking quotation as read:", error)
            return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error in mark-read quotation:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
