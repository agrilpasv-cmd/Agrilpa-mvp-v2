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

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = session.user.id

        // Use Admin client for counts and complex queries to bypass RLS issues 
        // while we aggregate full dashboard data.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Date reference for 7 day window
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const sevenDaysAgoIso = sevenDaysAgo.toISOString()

        // 1. Fetch User Products (To check if Seller & get performance)
        const { data: userProducts, error: productsError } = await supabaseAdmin
            .from("user_products")
            .select("id, title, views, category")
            .eq("user_id", userId)

        const isSeller = userProducts && userProducts.length > 0

        // 2. Fetch Quotations (As Seller and As Buyer)
        const { data: sellerQuotes, error: sqError } = await supabaseAdmin
            .from("quotations")
            .select("*")
            .eq("seller_id", userId)

        // Assuming email match as a fallback if buyer_id isn't fully migrated, but buyer_id is better.
        const { data: buyerQuotes, error: bqError } = await supabaseAdmin
            .from("quotations")
            .select("*")
            .eq("buyer_id", userId)

        const hasSentQuotes = buyerQuotes && buyerQuotes.length > 0

        // 3. Fetch Orders (As Seller and As Buyer)
        const { data: sellerOrders, error: soError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("seller_id", userId)

        const { data: buyerOrders, error: boError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .eq("buyer_id", userId)

        const hasBoughtOrders = buyerOrders && buyerOrders.length > 0
        const isBuyer = hasSentQuotes || hasBoughtOrders

        // 4. Determine Activity Type
        let activityType: "empty" | "buyer" | "seller" | "mixed" = "empty"
        if (isSeller && isBuyer) activityType = "mixed"
        else if (isSeller) activityType = "seller"
        else if (isBuyer) activityType = "buyer"

        // 5. Build Aggregated Payload

        // -- Seller KPIs --
        const sellerQuotes7d = sellerQuotes?.filter(q => q.created_at >= sevenDaysAgoIso).length || 0
        const sellerQuotesPending = sellerQuotes?.filter(q => q.status === "pending").length || 0
        const sellerOrdersConfirmed = sellerOrders?.filter(q => q.status === "Entregado" || q.status === "En Tránsito").length || 0 // Assuming logic based on prior mocked data

        // Calculate estimated value in negotiation (pending/accepted quotes)
        const valorNegociacion = sellerQuotes?.filter(q => q.status === "pending" || q.status === "accepted")
            .reduce((sum, q) => sum + (q.target_price || 0) * (q.quantity || 0), 0) || 0

        // -- Buyer KPIs --
        const buyerQuotesSent = buyerQuotes?.length || 0
        const buyerQuotesReceived = buyerQuotes?.filter(q => q.status === "accepted" || q.status === "rejected").length || 0 // Responses received from seller
        const buyerOrdersProcess = buyerOrders?.filter(o => o.status === "Preparación" || o.status === "En Tránsito").length || 0

        const totalComprado = buyerOrders?.filter(o => o.status === "Entregado")
            .reduce((sum, o) => {
                const p = typeof o.total_price === 'string' ? parseFloat(o.total_price) : (o.total_price || 0)
                return sum + p
            }, 0) || 0

        // -- Pipelines --
        // Simplified pipeline metrics based on DB state
        const pipelineVentas = {
            solicitudes: sellerQuotesPending,
            cotizaciones_enviadas: sellerQuotes?.filter(q => q.status === "accepted").length || 0, // 'Accepted' here usually means seller accepted to negotiate
            negociacion: sellerOrders?.filter(o => o.status === "Preparación").length || 0,
            pedidos_confirmados: sellerOrdersConfirmed
        }

        const pipelineCompras = {
            busqueda: 0, // Hard to track objectively
            solicitudes_enviadas: buyerQuotesSent,
            ofertas_recibidas: buyerQuotesReceived,
            compras_completadas: buyerOrders?.filter(o => o.status === "Entregado").length || 0
        }

        // -- Pending Actions Array --
        const pendingActions = []

        if (isSeller) {
            const pendingQs = sellerQuotes?.filter(q => q.status === "pending") || []
            pendingQs.forEach(q => {
                pendingActions.push({
                    id: `sq-${q.id}`,
                    type: "alert",
                    title: "Responder cotización",
                    description: `Cotización de ${q.buyer_name} necesita respuesta`,
                    actionText: "Responder",
                    actionLink: `/dashboard/cotizaciones/${q.id}`
                })
            })

            const prepOs = sellerOrders?.filter(o => o.status === "Preparación") || []
            prepOs.forEach(o => {
                pendingActions.push({
                    id: `so-${o.id}`,
                    type: "info",
                    title: "Despachar pedido",
                    description: `El pedido #${o.id.slice(0, 6)} está listo para ser despachado`,
                    actionText: "Confirmar",
                    actionLink: `/dashboard/ventas/${o.id}`
                })
            })
        }

        if (isBuyer) {
            const acceptedQs = buyerQuotes?.filter(q => q.status === "accepted") || []
            acceptedQs.forEach(q => {
                pendingActions.push({
                    id: `bq-${q.id}`,
                    type: "info",
                    title: "Revisar oferta recibida",
                    description: `Oferta para compra de ${q.product_title}`,
                    actionText: "Revisar",
                    actionLink: `/dashboard/mis-compras/${q.id}` // Or quote link
                })
            })
        }

        // -- Performance Section (Seller Top 5) --
        const performance = (userProducts || [])
            .map(p => {
                // Find requests for this specific product
                const requests = sellerQuotes?.filter(q => q.product_id === p.id).length || 0
                // Calculate conversion (requests / views)
                const views = p.views || 0
                const conversion = views > 0 ? (requests / views) * 100 : 0

                return {
                    id: p.id,
                    producto: p.title,
                    vistas: views,
                    solicitudes: requests,
                    conversion: `${conversion.toFixed(1)}%`
                }
            })
            .sort((a, b) => b.vistas - a.vistas) // Sort by views descending
            .slice(0, 5) // Top 5

        // Return unified structure
        return NextResponse.json({
            activityType,
            seller: {
                quotes_received_7d: sellerQuotes7d,
                quotes_pending: sellerQuotesPending,
                orders_confirmed: sellerOrdersConfirmed,
                valor_negociacion: `$${valorNegociacion.toLocaleString()}`,
            },
            buyer: {
                requests_sent: buyerQuotesSent,
                quotes_received: buyerQuotesReceived,
                orders_in_process: buyerOrdersProcess,
                total_bought: `$${totalComprado.toLocaleString()}`,
            },
            pipelineVentas,
            pipelineCompras,
            pendingActions: pendingActions.slice(0, 4), // Top 4 pending actions
            performance,
            recentActivity: [] // Could be populated by merging dates, omitting for brevity right now.
        })

    } catch (error) {
        console.error("Dashboard Dynamic Data Error:", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}
