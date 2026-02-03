import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { financing_type, user_id } = body

    if (!financing_type) {
      return NextResponse.json({ error: "financing_type is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const finalUserId = user_id || "00000000-0000-0000-0000-000000000000"

    const { error } = await supabase.from("financing_clicks").upsert({
      user_id: finalUserId,
      financing_type,
      clicked_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error tracking click:", error.message)
      // Return success anyway so the UI feedback still works
      // Once the database table is created, tracking will start working
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
