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
        // Include plan_type, plan_expires_at, and export_history for Pro features
        const { data: profile, error } = await supabaseAdmin
            .from("users")
            .select("id, full_name, company_name, country, bio, company_website, address, created_at, avatar_url, plan_type, plan_expires_at, export_history")
            .eq("id", userId)
            .single()

        if (error || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        // Calculate if user is Pro (with expiration check)
        let isPro = false
        if (profile.plan_type === "pro") {
            if (profile.plan_expires_at) {
                isPro = new Date(profile.plan_expires_at) > new Date()
            } else {
                isPro = true
            }
        }

        // Only expose export_history if user is Pro
        const safeProfile = {
            id: profile.id,
            full_name: profile.full_name,
            company_name: profile.company_name,
            country: profile.country,
            bio: profile.bio,
            company_website: profile.company_website,
            address: profile.address,
            created_at: profile.created_at,
            avatar_url: profile.avatar_url,
            is_pro: isPro,
            export_history: isPro ? (profile.export_history || []) : [],
        }

        return NextResponse.json({ profile: safeProfile })
    } catch (error: any) {
        console.error("[Public Profile API] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
