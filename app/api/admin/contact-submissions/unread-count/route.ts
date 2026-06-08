import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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

    // Using head to just get the count without fetching data
    const { count, error } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)

    if (error) {
      if (error.code === '42703') {
        // Column is_read does not exist yet. Return 0 to prevent crashing the UI until the user runs the SQL migration.
        return NextResponse.json({ unreadCount: 0 })
      }
      throw error
    }

    return NextResponse.json({ unreadCount: count || 0 })
  } catch (error) {
    console.error("[Agrilpa] Error fetching unread contact submissions count:", error)
    return NextResponse.json({ unreadCount: 0 })
  }
}
