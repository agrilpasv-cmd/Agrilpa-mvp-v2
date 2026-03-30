import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Only expose safe public fields — never email, phone, internal data
        const { data: profile, error } = await supabaseAdmin
            .from("users")
            .select("id, full_name, company_name, country, bio, company_website, address, created_at, avatar_url")
            .eq("id", userId)
            .single()

        if (error || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        return NextResponse.json({ profile })
    } catch (error: any) {
        console.error("[Public Profile API] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
