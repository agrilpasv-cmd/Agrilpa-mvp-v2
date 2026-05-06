import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { activity_type, description, metadata, user_id, path } = body
    
    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const ipAddress = headersList.get("x-forwarded-for") || ""

    const { error } = await supabase
      .from("user_activities")
      .insert([{
        user_id,
        activity_type,
        description,
        metadata: metadata || {},
        path,
        ip_address: ipAddress,
        user_agent: userAgent
      }])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[Track Error]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
