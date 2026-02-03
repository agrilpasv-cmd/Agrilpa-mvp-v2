import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { rating, comment } = await request.json()

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return Response.json({ error: "Invalid rating" }, { status: 400 })
    }

    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Use real user ID if authenticated, otherwise use a fixed UUID for anonymous users
    const userId = session?.user?.id || "00000000-0000-0000-0000-000000000000"

    // Insert rating into database
    const { error: insertError } = await supabase.from("purchase_ratings").insert([
      {
        user_id: userId,
        rating,
        comment: comment || null,
      },
    ])

    if (insertError) {
      console.error("[v0] Error inserting rating:", insertError)
      return Response.json({ error: "Failed to save rating", details: insertError.message }, { status: 500 })
    }

    return Response.json({ success: true, message: "Rating saved successfully" })
  } catch (error) {
    console.error("[v0] Error in submit-rating API:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
