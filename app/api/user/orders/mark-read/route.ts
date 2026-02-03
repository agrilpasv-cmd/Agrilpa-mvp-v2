
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { ids, all } = body
        console.log("Mark Read API Triggered. Body:", body)

        if (all) {
            // Mark all user's purchases as read
            const { error } = await supabase
                .from("purchases")
                .update({ is_read: true })
                .eq("user_id", user.id)
                .eq("is_read", false) // Only update unread ones

            if (error) throw error
        } else if (ids && Array.isArray(ids)) {
            // Mark specific IDs as read
            const { error } = await supabase
                .from("purchases")
                .update({ is_read: true })
                .in("id", ids)
                .eq("user_id", user.id)

            if (error) throw error
        } else {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Mark Read Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
