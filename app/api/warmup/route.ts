import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This endpoint warms up the Supabase connection with a minimal query.
// Call it from the client on app load so the DB is ready when products are requested.
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    // Lightest possible query — just ping the DB
    await supabase.from("user_products").select("id").limit(1)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}
