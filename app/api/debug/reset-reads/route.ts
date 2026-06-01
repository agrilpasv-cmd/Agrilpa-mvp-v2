
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    const supabase = await createClient()
    try {
        const { error } = await supabase.from("purchases").update({ is_read: false }).neq("id", "00000000-0000-0000-0000-000000000000")
        if (error) throw error
        return NextResponse.json({ success: true, message: "Reset complete" })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
