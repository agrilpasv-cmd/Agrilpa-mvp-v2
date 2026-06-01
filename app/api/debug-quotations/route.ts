import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )
        const { data, error } = await supabaseAdmin.from("quotations").select("*")
        return NextResponse.json({ data, error })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
