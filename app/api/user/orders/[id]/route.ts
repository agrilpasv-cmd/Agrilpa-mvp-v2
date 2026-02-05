import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
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

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Use Admin client to ensure we can fetch data even if RLS policies are tricky for now
        // Ideally we should rely on standard client + RLS, but for 'ventas' (seller view) we need to be sure.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 1. Try Fetching from 'orders'
        let finalData: any = null
        let origin = 'orders'

        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("id", id)
            .single()

        if (order) {
            finalData = order
        } else {
            // 2. Try Fetching from 'purchases'
            const { data: purchase, error: purchaseError } = await supabaseAdmin
                .from("purchases")
                .select("*")
                .eq("id", id)
                .single()

            if (purchase) {
                finalData = purchase
                origin = 'purchases'
            }
        }

        if (!finalData) {
            return NextResponse.json({ error: "Record not found" }, { status: 404 })
        }

        // Verify ownership
        const ownerId = origin === 'orders' ? finalData.buyer_id : finalData.user_id
        if (finalData.seller_id !== userId && ownerId !== userId) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 })
        }

        // Fetch Seller Data
        const { data: sellerProfile } = await supabaseAdmin
            .from("users")
            .select("full_name, company_name, phone_number")
            .eq("id", finalData.seller_id)
            .single()

        // Format data for frontend
        const formattedOrder = origin === 'orders' ? {
            id: finalData.id,
            price_usd: typeof finalData.total_price === 'string' ? parseFloat(finalData.total_price) : (finalData.total_price || 0),
            price_bs: 0,
            quantity_kg: finalData.quantity,
            product_name: finalData.product_name,
            product_slug: finalData.product_id,
            product_image: finalData.product_image,
            full_name: finalData.buyer_name,
            email: finalData.buyer_email,
            country_code: "58",
            phone_number: finalData.buyer_phone ? finalData.buyer_phone.replace("+58", "").trim() : "",
            address: finalData.shipping_address,
            city: "N/A",
            state: "N/A",
            zip_code: "N/A",
            country: "Venezuela",
            payment_method: "A convenir",
            special_instructions: finalData.origin === 'quotation' ? "Via Cotización" : "",
            incoterm: finalData.incoterm || "EXW",
            status: finalData.status || "Pendiente",
            created_at: finalData.created_at,
            shipping_method: "A convenir",
            // Seller Info
            seller_name: sellerProfile?.full_name || "Vendedor Agrilpa",
            seller_company: sellerProfile?.company_name || "Empresa Verificada",
            seller_phone: sellerProfile?.phone_number || "Contactar via Chat",
            unit_price: typeof finalData.unit_price === 'string' ? parseFloat(finalData.unit_price) : (finalData.unit_price || 0),
            // Technical fields
            category: finalData.category || "General",
            origin_country: finalData.origin_country || "Venezuela",
            maturity: finalData.maturity || "Sin especificar",
            packaging_type: finalData.packaging_type || "Estándar",
            packaging_size: finalData.packaging_size || "N/A",
            certifications: finalData.certifications || "En proceso",
            seller_contact_method: finalData.seller_contact_method || "Plataforma Agrilpa",
            seller_contact_info: finalData.seller_contact_info || ""
        } : {
            // Native purchase record (direct buy)
            id: finalData.id,
            price_usd: typeof finalData.price_usd === 'string' ? parseFloat(finalData.price_usd) : (finalData.price_usd || 0),
            unit_price: typeof finalData.price_usd === 'string' ? (parseFloat(finalData.price_usd) / (finalData.quantity_kg || 1)) : ((finalData.price_usd || 0) / (finalData.quantity_kg || 1)),
            price_bs: 0,
            quantity_kg: finalData.quantity_kg,
            product_name: finalData.product_name,
            product_slug: finalData.product_slug,
            product_image: finalData.product_image,
            full_name: finalData.full_name,
            email: finalData.email,
            country_code: finalData.country_code || "58",
            phone_number: finalData.phone_number,
            address: finalData.address,
            city: finalData.city,
            state: finalData.state,
            zip_code: finalData.zip_code,
            country: finalData.country,
            payment_method: finalData.payment_method,
            special_instructions: finalData.special_instructions,
            incoterm: "N/A",
            status: finalData.status || "Pagado",
            created_at: finalData.created_at,
            shipping_method: finalData.shipping_method,
            // Seller Info (Purchases might not have seller_id directly depending on schema, but let's try)
            seller_name: "Vendedor Agrilpa",
            seller_company: "Empresa Verificada",
            // Fallbacks for direct purchases (unless we update purchases table too)
            category: "General",
            origin_country: "Venezuela",
            maturity: "Sin especificar",
            packaging_type: "Estándar",
            packaging_size: "N/A",
            certifications: "Verificada",
            seller_contact_method: "Plataforma Agrilpa",
            seller_contact_info: ""
        }

        return NextResponse.json({ order: formattedOrder })

    } catch (error) {
        console.error("Error fetching order detail:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
