import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

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

export async function GET() {
  try {
    const { data: imagesData, error: imagesError } = await supabase
      .from("hero_images")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })

    if (imagesError) throw imagesError

    const { data: settingsData, error: settingsError } = await supabase
      .from("hero_images")
      .select("link_url")
      .eq("id", "00000000-0000-0000-0000-000000000000")
      .single()

    const interval = settingsData?.link_url ? parseInt(settingsData.link_url, 10) : 3500;

    return NextResponse.json({ images: imagesData, interval })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
