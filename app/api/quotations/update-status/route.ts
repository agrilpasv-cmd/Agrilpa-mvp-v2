import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { quotationId, status } = body

        if (!quotationId || !status) {
            return NextResponse.json(
                { success: false, error: "quotationId y status son requeridos" },
                { status: 400 }
            )
        }

        if (!["pending", "accepted", "rejected"].includes(status)) {
            return NextResponse.json(
                { success: false, error: "Status inválido" },
                { status: 400 }
            )
        }

        // Get the quotation first
        const { data: quotation, error: fetchError } = await supabaseAdmin
            .from("quotations")
            .select("*")
            .eq("id", quotationId)
            .single()

        if (fetchError || !quotation) {
            return NextResponse.json(
                { success: false, error: "Cotización no encontrada" },
                { status: 404 }
            )
        }

        // Update the quotation status
        const { data, error } = await supabaseAdmin
            .from("quotations")
            .update({ status })
            .eq("id", quotationId)
            .select()

        if (error) {
            console.error("Error updating quotation:", error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        // If accepted, create an order in the orders table
        let orderCreated = null
        if (status === "accepted") {
            // Create order in the orders table
            const { data: orderData, error: orderError } = await supabaseAdmin
                .from("orders")
                .insert([
                    {
                        quotation_id: quotationId,
                        product_id: quotation.product_id,
                        product_title: quotation.product_title,
                        product_image: quotation.product_image,
                        seller_id: quotation.seller_id,
                        buyer_name: quotation.buyer_name,
                        buyer_email: quotation.email,
                        buyer_phone: quotation.phone_number ? `+${quotation.country_code}${quotation.phone_number}` : null,
                        contact_method: quotation.contact_method,
                        quantity: quotation.quantity,
                        destination_country: quotation.destination_country,
                        estimated_date: quotation.estimated_date,
                        notes: quotation.notes,
                        status: "confirmed",
                        created_at: new Date().toISOString()
                    }
                ])
                .select()

            if (orderError) {
                console.error("Error creating order:", orderError)
                // If table doesn't exist, log but continue
                if (orderError.message.includes("relation") && orderError.message.includes("does not exist")) {
                    console.log("Orders table doesn't exist yet. Please create it in Supabase.")
                }
            } else {
                orderCreated = orderData?.[0]
                console.log("Order created:", orderCreated)
            }
        }

        return NextResponse.json({
            success: true,
            quotation: data[0],
            order: orderCreated
        })
    } catch (error) {
        console.error("Error in update-status:", error)
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}
