import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    })

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("subscriptions").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting subscription:", error)
      return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete subscription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
