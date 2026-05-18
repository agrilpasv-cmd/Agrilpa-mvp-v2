import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Step 1: Check for manually featured product IDs
    const { data: featuredRow } = await supabase
      .from("hero_images")
      .select("link_url")
      .eq("id", "11111111-1111-1111-1111-111111111111")
      .maybeSingle()

    const featuredIds: string[] = featuredRow?.link_url
      ? featuredRow.link_url.split(",").filter(Boolean)
      : []

    // Step 2: Fetch products — WITHOUT the image field (it's base64 and huge)
    let productsData: any[] = []

    if (featuredIds.length > 0) {
      const { data } = await supabase
        .from("user_products")
        .select("id, title, category, description, country, price, min_order, user_id")
        .eq("is_visible", true)
        .in("id", featuredIds)

      productsData = (data || []).sort(
        (a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id)
      )
    } else {
      const { data } = await supabase
        .from("user_products")
        .select("id, title, category, description, country, price, min_order, user_id")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(4)

      productsData = data || []
    }

    if (productsData.length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    // Step 3: Fetch seller info
    const userIds = [...new Set(productsData.map((p) => p.user_id).filter(Boolean))]
    let usersMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, plan_type, plan_expires_at, company_name")
        .in("id", userIds)

      if (usersData) {
        const now = new Date()
        usersData.forEach((user) => {
          let sellerIsPro = false
          if (user.plan_type === "pro") {
            sellerIsPro = user.plan_expires_at
              ? new Date(user.plan_expires_at) > now
              : true
          }
          usersMap[user.id] = { ...user, sellerIsPro }
        })
      }
    }

    const processed = productsData.slice(0, 4).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      country: p.country,
      price: p.price,
      min_order: p.min_order,
      company_name: usersMap[p.user_id]?.company_name || null,
      seller_is_pro: usersMap[p.user_id]?.sellerIsPro || false,
      // No image field — loaded separately via /api/products/[id]/thumb
    }))

    const response = NextResponse.json({ products: processed }, { status: 200 })
    // Cache 5 minutes in CDN
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60")
    return response
  } catch (error) {
    console.error("[featured-preview] Error:", error)
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}
