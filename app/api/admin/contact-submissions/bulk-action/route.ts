import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { ids, action } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: "No IDs provided" }, { status: 400 })
    }

    if (!['delete', 'mark-read', 'mark-unread'].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    if (action === 'delete') {
      const { error } = await supabase
        .from("contact_submissions")
        .delete()
        .in("id", ids)

      if (error) throw error
    } else if (action === 'mark-read') {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read: true })
        .in("id", ids)

      if (error) throw error
    } else if (action === 'mark-unread') {
      const { error } = await supabase
        .from("contact_submissions")
        .update({ is_read: false })
        .in("id", ids)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Agrilpa] Error in bulk action:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
