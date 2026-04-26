import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const revalidate = 60

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // First fetch products
    const { data: productsData, error: productsError } = await supabase
      .from("user_products")
      .select("id, title, category, description, country, image, price, quantity, min_order, contact_method, contact_info, shipping_unit_type, container_size, user_id")
      .eq("is_visible", true)
      .order("created_at", { ascending: false })
      .limit(20)

    if (productsError) {
      console.error("[API] Database fetch error:", productsError)
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    if (!productsData || productsData.length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 })
    }

    // Then fetch users for those products
    const userIds = [...new Set(productsData.map(p => p.user_id).filter(Boolean))]
    let usersMap: Record<string, any> = {}

    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, plan_type, plan_expires_at, company_name")
        .in("id", userIds)

      if (!usersError && usersData) {
        usersData.forEach(user => {
          usersMap[user.id] = user
        })
      }
    }

    // Fetch reviews for these products
    const productIds = productsData.map(p => p.id)
    let reviewsMap: Record<string, { totalRating: number, count: number }> = {}
    if (productIds.length > 0) {
      const { data: reviewsData } = await supabase
        .from("product_reviews")
        .select("product_id, rating")
        .in("product_id", productIds)
        
      if (reviewsData) {
        reviewsData.forEach(review => {
          if (!reviewsMap[review.product_id]) {
            reviewsMap[review.product_id] = { totalRating: 0, count: 0 }
          }
          reviewsMap[review.product_id].totalRating += review.rating
          reviewsMap[review.product_id].count += 1
        })
      }
    }

    // Process products: determine if seller is Pro (with expiration check) and add ratings
    const now = new Date()
    const processed = productsData.map((p: any) => {
      const user = usersMap[p.user_id]
      let sellerIsPro = false
      if (user && user.plan_type === "pro") {
        // Check if plan has expired
        if (user.plan_expires_at) {
          sellerIsPro = new Date(user.plan_expires_at) > now
        } else {
          sellerIsPro = true // No expiry = active Pro
        }
      }
      
      const revData = reviewsMap[p.id]
      const reviewsCount = revData?.count || 0
      const averageRating = reviewsCount > 0 ? (revData.totalRating / reviewsCount).toFixed(1) : 0

      return {
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        country: p.country,
        image: p.image,
        price: p.price,
        quantity: p.quantity,
        min_order: p.min_order,
        contact_method: p.contact_method,
        contact_info: p.contact_info,
        shipping_unit_type: p.shipping_unit_type || null,
        container_size: p.container_size || null,
        company_name: user?.company_name || null,
        seller_is_pro: sellerIsPro,
        rating: Number(averageRating),
        reviews: reviewsCount,
      }
    })

    // Sort: Pro sellers first, then by original order
    processed.sort((a: any, b: any) => {
      if (a.seller_is_pro && !b.seller_is_pro) return -1
      if (!a.seller_is_pro && b.seller_is_pro) return 1
      return 0
    })

    const response = NextResponse.json({ products: processed }, { status: 200 })
    // Cache 60s in browser, 300s in CDN/edge
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60")
    return response
  } catch (error) {
    console.error("[API] Internal error:", error)
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}

