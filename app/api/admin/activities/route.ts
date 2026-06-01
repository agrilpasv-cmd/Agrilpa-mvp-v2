import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") // optional filter by user

    // Get the ID for agrilpasv@gmail.com to exclude their activities
    const { data: adminUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", "agrilpasv@gmail.com")
      .maybeSingle()

    // 1. Fetch activities
    let query = supabase
      .from("user_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)

    // Exclude the admin email
    if (adminUser?.id) {
      query = query.neq("user_id", adminUser.id)
    }

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: activities, error } = await query

    if (error) throw error
    if (!activities || activities.length === 0) {
      return NextResponse.json({ activities: [] })
    }

    // 2. Get unique user IDs (excluding nulls)
    const userIds = [...new Set(activities.map((a) => a.user_id).filter(Boolean))]

    // 3. Fetch user profiles for those IDs
    let userMap: Record<string, { full_name: string; email: string }> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds)

      if (profiles) {
        profiles.forEach((p) => {
          userMap[p.id] = { full_name: p.full_name || "", email: p.email || "" }
        })
      }
    }

    // 4. Merge user info into activities
    const formattedActivities = activities.map((a) => ({
      ...a,
      user_name: a.user_id ? (userMap[a.user_id]?.full_name || "Sin nombre") : "Invitado",
      user_email: a.user_id ? (userMap[a.user_id]?.email || "Sin correo") : "No registrado",
    }))

    return NextResponse.json({ activities: formattedActivities })
  } catch (err: any) {
    console.error("[Activities Fetch Error]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
