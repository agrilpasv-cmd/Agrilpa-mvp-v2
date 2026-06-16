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
      return NextResponse.redirect(new URL("/placeholder.svg", _request.url))
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
      return NextResponse.redirect(new URL("/placeholder.svg", _request.url))
    }

    // data.image is likely "data:image/jpeg;base64,/9j/4AAQ..."
    const match = data.image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
        const mimeType = match[1]
        const base64Data = match[2]
        const buffer = Buffer.from(base64Data, "base64")
        
        return new NextResponse(buffer, {
            headers: {
                "Content-Type": mimeType,
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
            }
        })
    }

    // Fallback if not a data URI
    return NextResponse.redirect(new URL("/placeholder.svg", _request.url))
  } catch {
    return NextResponse.redirect(new URL("/placeholder.svg", _request.url))
  }
}
