import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const supabase = await createServerClient()

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({
                authenticated: false,
                error: authError?.message
            })
        }

        // Try to get user data from users table
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single()

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
            },
            userData: userData,
            userError: userError?.message,
            hasRole: userData?.role,
            isAdmin: userData?.role === "admin",
        })
    } catch (error) {
        return NextResponse.json({
            error: "Error interno",
            details: error instanceof Error ? error.message : String(error)
        })
    }
}
