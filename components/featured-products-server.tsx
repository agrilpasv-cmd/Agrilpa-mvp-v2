// Server Component — fetches featured products at request time (SSR)
// This is NOT a client component, so it runs on the server before the page is sent.
import { createClient } from "@supabase/supabase-js"
import { ProductPreview, FeaturedProduct } from "./product-preview"

async function fetchFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check for manually selected featured product IDs
    const { data: featuredRow } = await supabase
      .from("hero_images")
      .select("link_url")
      .eq("id", "11111111-1111-1111-1111-111111111111")
      .maybeSingle()

    const featuredIds: string[] = featuredRow?.link_url
      ? featuredRow.link_url.split(",").filter(Boolean)
      : []

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

    if (!productsData.length) return []

    // Fetch seller pro status
    const userIds = [...new Set(productsData.map((p) => p.user_id).filter(Boolean))]
    const usersMap: Record<string, { sellerIsPro: boolean; company_name: string }> = {}

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
          usersMap[user.id] = { sellerIsPro, company_name: user.company_name || "" }
        })
      }
    }

    return productsData.slice(0, 4).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      description: p.description,
      country: p.country,
      price: p.price,
      min_order: p.min_order,
      company_name: usersMap[p.user_id]?.company_name || null,
      seller_is_pro: usersMap[p.user_id]?.sellerIsPro || false,
    }))
  } catch (err) {
    console.error("[FeaturedProducts SSR] Error:", err)
    return []
  }
}

export async function FeaturedProductsServer() {
  const products = await fetchFeaturedProducts()
  return <ProductPreview initialProducts={products} />
}
