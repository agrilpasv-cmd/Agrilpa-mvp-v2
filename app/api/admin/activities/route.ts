import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function GET() {
  try {
    // We join with profiles/users if possible. 
    // Since Auth.users is not directly joinable in simple queries without a profile table, 
    // we'll fetch activities and then fetch user details if needed, 
    // or assume there is a 'users' table in public schema that syncs with auth.users.
    
    // Let's check if there's a public 'users' table first.
    const { data: activities, error } = await supabase
      .from("user_activities")
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(200)

    if (error) {
      // Fallback if the join fails (maybe the users table is different)
      const { data: simpleActivities, error: simpleError } = await supabase
        .from("user_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)
        
      if (simpleError) throw simpleError
      return NextResponse.json({ activities: simpleActivities })
    }

    // Map data to flatten user info
    const formattedActivities = activities.map((a: any) => ({
      ...a,
      user_name: a.user?.full_name,
      user_email: a.user?.email
    }))

    return NextResponse.json({ activities: formattedActivities })
  } catch (err: any) {
    console.error("[Activities Fetch Error]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
