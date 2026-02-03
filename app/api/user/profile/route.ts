import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Use Admin Client to bypass RLS policies
        const adminClient = createAdminClient()
        const { data: profile, error: profileError } = await adminClient
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single()

        if (profileError) {
            console.error("[v0] Profile API error:", profileError)
            // If profile doesn't exist in public table yet, we can fallback to auth data
        }

        // Combine data
        const userData = {
            ...profile,
            email: user.email, // Ensure email comes from auth
            products_of_interest: user.user_metadata?.products_of_interest || [],
            annual_volume: user.user_metadata?.annual_volume,
            // Any other metadata fields
        }

        return NextResponse.json({ user: userData })
    } catch (error: any) {
        console.error("[v0] Profile API unexpected error:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
