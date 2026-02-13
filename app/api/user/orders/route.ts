import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                    },
                },
            },
        )

        // 1. Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const userId = session.user.id

        // 2. Fetch orders using Admin client to bypass RLS, focusing on buyer_id
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // 2. Fetch from 'orders' (Quotations accepted)
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("buyer_id", userId)

        // 3. Fetch from 'purchases' (Direct buys)
        const { data: purchases, error: purchasesError } = await supabaseAdmin
            .from("purchases")
            .select("*")
            .eq("user_id", userId)

        if (ordersError && !ordersError.message.includes("relation \"orders\" does not exist")) {
            console.error("[API/user/orders] Orders error:", ordersError)
            return NextResponse.json({ error: ordersError.message }, { status: 500 })
        }

        if (purchasesError && !purchasesError.message.includes("relation \"purchases\" does not exist")) {
            console.error("[API/user/orders] Purchases error:", purchasesError)
            return NextResponse.json({ error: purchasesError.message }, { status: 500 })
        }

        // Map and unify
        // 4. Collect all seller IDs to fetch their names
        const sellerIds = Array.from(new Set([
            ...(orders || []).map(o => o.seller_id),
            ...(purchases || []).map(p => p.seller_id).filter(Boolean)
        ]));

        let sellerProfiles: Record<string, any> = {};
        if (sellerIds.length > 0) {
            const { data: profiles } = await supabaseAdmin
                .from("users")
                .select("id, full_name, company_name")
                .in("id", sellerIds);

            profiles?.forEach(p => {
                sellerProfiles[p.id] = p;
            });
        }

        // 5. Collect all product IDs to fetch their images
        const productIds = Array.from(new Set([
            ...(orders || []).map(o => o.product_id).filter(Boolean),
            ...(purchases || []).map(p => p.product_slug || p.product_id).filter(Boolean)
        ]));

        let productImages: Record<string, string> = {};
        if (productIds.length > 0) {
            const { data: products } = await supabaseAdmin
                .from("user_products")
                .select("id, image")
                .in("id", productIds);

            products?.forEach(p => {
                if (p.image) {
                    productImages[p.id] = p.image;
                }
            });
        }

        const mappedOrders = (orders || []).map(order => {
            const seller = sellerProfiles[order.seller_id];
            return {
                ...order,
                seller_name: seller?.full_name || "Vendedor Agrilpa",
                seller_company: seller?.company_name || "Empresa Verificada",
                full_name: seller?.company_name || seller?.full_name || "Vendedor Agrilpa",
                quantity_kg: order.quantity,
                price_usd: typeof order.total_price === 'string' ? parseFloat(order.total_price) : (order.total_price || 0),
                product_slug: order.product_id,
                product_image: order.product_image || productImages[order.product_id] || null,
                origin_table: 'orders'
            };
        });

        const mappedPurchases = (purchases || []).map(purchase => {
            const seller = purchase.seller_id ? sellerProfiles[purchase.seller_id] : null;
            const pSlug = purchase.product_slug || purchase.product_id;
            return {
                ...purchase,
                seller_name: seller?.full_name || "Vendedor Agrilpa",
                seller_company: seller?.company_name || "Empresa Verificada",
                full_name: seller?.company_name || seller?.full_name || "Vendedor Agrilpa",
                product_image: purchase.product_image || (pSlug ? productImages[pSlug] : null) || null,
                origin_table: 'purchases'
            };
        });

        const allOrders = [...mappedOrders, ...mappedPurchases].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return NextResponse.json({ orders: allOrders }, { status: 200 });

    } catch (error: any) {
        console.error("[API/user/orders] Catch error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
