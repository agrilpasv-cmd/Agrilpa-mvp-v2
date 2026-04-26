import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        // Verify user session
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]))
                    },
                },
            },
        )

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { index } = body

        if (index === undefined || index === null) {
            return NextResponse.json({ error: "index is required" }, { status: 400 })
        }

        const userId = session.user.id

        // Admin client for DB operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Get current export_history
        const { data: profile } = await supabaseAdmin
            .from("users")
            .select("export_history")
            .eq("id", userId)
            .single()

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 })
        }

        const currentHistory = profile.export_history || []

        if (index < 0 || index >= currentHistory.length) {
            return NextResponse.json({ error: "Invalid index" }, { status: 400 })
        }

        // Remove item at index
        const updatedHistory = currentHistory.filter((_: any, i: number) => i !== index)

        const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({ export_history: updatedHistory })
            .eq("id", userId)

        if (updateError) {
            console.error("[Delete Export History] Error:", updateError)
            return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
        }

        return NextResponse.json({ success: true, export_history: updatedHistory })
    } catch (error: any) {
        console.error("[Delete Export History] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
