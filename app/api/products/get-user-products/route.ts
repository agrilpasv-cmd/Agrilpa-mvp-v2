import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Revalidate every 60 seconds (ISR-style caching)
export const revalidate = 60

export async function GET() {
  try {
    // Use anon client without cookie session — public read only, no auth needed for product listing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
      .from("user_products")
      .select("id, title, category, description, country, image, company_name")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[API] Database fetch error:", error)
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    const response = NextResponse.json({ products: data || [] }, { status: 200 })
    // Cache 60s in browser, 300s in CDN/edge
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60")
    return response
  } catch (error) {
    console.error("[API] Internal error:", error)
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}
