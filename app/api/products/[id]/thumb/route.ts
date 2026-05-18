import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 13+ App Router, params must be awaited
    const { id } = await context.params

    if (!id) {
      return NextResponse.json({ image: null }, { status: 200 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await supabase
      .from("user_products")
      .select("image")
      .eq("id", id)
      .maybeSingle()

    if (!data?.image) {
      return NextResponse.json({ image: null }, { status: 200 })
    }

    const response = NextResponse.json({ image: data.image }, { status: 200 })
    response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=120")
    return response
  } catch {
    return NextResponse.json({ image: null }, { status: 200 })
  }
}
