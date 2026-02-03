import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()

    console.log("[v0] Fetching contact submissions API called")

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] SUPABASE_SERVICE_ROLE_KEY is missing")
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      },
    )

    const { data, error, count } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error fetching submissions:", error)
      throw error
    }

    console.log(`[v0] Successfully fetched ${data?.length} submissions (count: ${count})`)

    return Response.json({ data, count })
  } catch (error) {
    console.error("[v0] Error fetching contact submissions:", error)
    return Response.json({ error: "Failed to fetch contact submissions" }, { status: 500 })
  }
}
