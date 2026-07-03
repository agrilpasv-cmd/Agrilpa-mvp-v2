import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Cache the DB connection across invocations in serverless environments
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// In-memory cache for this serverless instance (survives warm invocations)
const imageCache = new Map<string, { buffer: Buffer; mimeType: string; etag: string }>()

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    if (!id) {
      return NextResponse.redirect(new URL("/placeholder.svg", request.url))
    }

    // Check in-memory cache first (avoids DB hit on warm Lambda)
    const cached = imageCache.get(id)
    const ifNoneMatch = request.headers.get("if-none-match")

    if (cached) {
      if (ifNoneMatch === cached.etag) {
        return new NextResponse(null, {
          status: 304,
          headers: {
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
            "ETag": cached.etag,
          }
        })
      }
      return new NextResponse(cached.buffer, {
        headers: {
          "Content-Type": cached.mimeType,
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
          "ETag": cached.etag,
        }
      })
    }

    const { data } = await supabaseAdmin
      .from("user_products")
      .select("image")
      .eq("id", id)
      .maybeSingle()

    if (!data?.image) {
      return NextResponse.redirect(new URL("/placeholder.svg", request.url))
    }

    const match = data.image.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
      const mimeType = match[1]
      const base64Data = match[2]
      const buffer = Buffer.from(base64Data, "base64")
      const etag = `"${id}-${buffer.length}"`

      // Store in warm-instance cache (max 100 entries to avoid memory bloat)
      if (imageCache.size >= 100) {
        const firstKey = imageCache.keys().next().value
        if (firstKey) imageCache.delete(firstKey)
      }
      imageCache.set(id, { buffer, mimeType, etag })

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
          "ETag": etag,
        }
      })
    }

    return NextResponse.redirect(new URL("/placeholder.svg", request.url))
  } catch {
    return NextResponse.redirect(new URL("/placeholder.svg", request.url))
  }
}
