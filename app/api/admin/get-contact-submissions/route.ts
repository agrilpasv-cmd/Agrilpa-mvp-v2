import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log("[Agrilpa] Fetching contact submissions API called")

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[Agrilpa] SUPABASE_SERVICE_ROLE_KEY is missing")
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

    const { data, error, count } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Agrilpa] Supabase error fetching submissions:", error)
      throw error
    }

    console.log(`[Agrilpa] Successfully fetched ${data?.length} submissions (count: ${count})`)

    return NextResponse.json({ data, count })
  } catch (error) {
    console.error("[Agrilpa] Error fetching contact submissions:", error)
    return NextResponse.json({ error: "Failed to fetch contact submissions" }, { status: 500 })
  }
}
