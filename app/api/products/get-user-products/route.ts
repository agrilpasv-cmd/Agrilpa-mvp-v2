import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    console.log("[API] Fetching visible user products...")

    // Note: We use ANON key here with RLS. 
    // If 'is_visible' is a column, RLS must allow reading it.
    // Ideally, we should filter by is_visible=true.

    const { data, error } = await supabase
      .from("user_products")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[API] Database fetch error:", error)
      return NextResponse.json({ products: [] }, { status: 200 }) // Return empty on error to avoid breaking UI
    }

    console.log(`[API] Found ${data?.length || 0} visible products`)

    return NextResponse.json({ products: data || [] }, { status: 200 })
  } catch (error) {
    console.error("[API] Internal error:", error)
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}
