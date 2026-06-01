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
        const { url, type, label } = body

        if (!url || !type || !label) {
            return NextResponse.json({ error: "url, type, and label are required" }, { status: 400 })
        }

        if (!["container_photo", "certificate"].includes(type)) {
            return NextResponse.json({ error: "type must be 'container_photo' or 'certificate'" }, { status: 400 })
        }

        const userId = session.user.id

        // Admin client for DB operations
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Verify user is Pro
        const { data: profile } = await supabaseAdmin
            .from("users")
            .select("plan_type, plan_expires_at, export_history")
            .eq("id", userId)
            .single()

        if (!profile || profile.plan_type !== "pro") {
            return NextResponse.json({ error: "Esta función es exclusiva para usuarios Pro" }, { status: 403 })
        }

        // Check expiration
        if (profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) {
            return NextResponse.json({ error: "Tu membresía Pro ha expirado" }, { status: 403 })
        }

        // Add new item to export_history
        const currentHistory = profile.export_history || []
        const newItem = {
            url,
            type,
            label,
            uploaded_at: new Date().toISOString()
        }

        const updatedHistory = [...currentHistory, newItem]

        const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({ export_history: updatedHistory })
            .eq("id", userId)

        if (updateError) {
            console.error("[Upload Export History] Error:", updateError)
            return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
        }

        return NextResponse.json({ success: true, export_history: updatedHistory })
    } catch (error: any) {
        console.error("[Upload Export History] Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
