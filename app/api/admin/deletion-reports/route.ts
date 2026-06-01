import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const adminClient = createAdminClient()
        const { data, error } = await adminClient
            .from("account_deletion_reports")
            .select("id, user_email, reason, custom_reason, deleted_at")
            .order("deleted_at", { ascending: false })

        if (error) {
            console.error("[DeletionReports] Fetch error:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ reports: data ?? [] })
    } catch (err) {
        console.error("[DeletionReports] Unexpected error:", err)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}
