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
        const { data: updateData, error: updateError } = await supabaseAdmin
            .from("quotations")
            .update({ status: status })
            .eq("id", quotationId)
            .select()

        if (updateError) {
            console.error("Error updating quotation status:", updateError)
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            )
        }

        const updateResult = updateData?.[0]

        // If accepted, create a record in the new 'orders' table (Unified Sales source)
        let orderCreated = null
        if (status === "accepted") {
            // 0. Fetch the actual product to get accurate details
            const { data: productData } = await supabaseAdmin
                .from("user_products")
                .select("slug, name, image, vendor_id, id, category, country, maturity, packaging, packaging_size, certifications, contact_method, contact_info, price")
                .eq("id", quotation.product_id)
                .single()

            const actualSellerId = productData?.vendor_id || quotation.seller_id
            const actualName = productData?.name || quotation.product_title
            const actualImage = productData?.image || quotation.product_image

            // 1. Create Order record
            const targetP = typeof quotation.target_price === 'string' ? parseFloat(quotation.target_price) : (quotation.target_price || 0)
            const baseUnitPrice = targetP || (productData?.price && !isNaN(parseFloat(productData.price)) ? parseFloat(productData.price) : 0)

            const orderPayload: any = {
                buyer_id: quotation.buyer_id,
                seller_id: actualSellerId,
                product_id: quotation.product_id,
                product_name: actualName,
                product_image: actualImage,
                quantity: quotation.quantity,
                unit_price: baseUnitPrice, // Usar el precio pactado o el base del producto
                total_price: (baseUnitPrice) * (quotation.quantity || 1), // Calcular total
                buyer_name: quotation.buyer_name,
                buyer_email: quotation.email,
                buyer_phone: quotation.phone_number ? `+${quotation.country_code}${quotation.phone_number}` : null,
                shipping_address: quotation.destination_country || "A convenir",
                status: "pending",
                origin: "quotation",
                quotation_id: quotationId,
                is_read_seller: false,
                created_at: new Date().toISOString(),
                // New Technical fields
                category: productData?.category || null,
                origin_country: productData?.country || null,
                maturity: productData?.maturity || null,
                packaging_type: productData?.packaging || null,
                packaging_size: productData?.packaging_size || null,
                certifications: productData?.certifications || null,
                seller_contact_method: productData?.contact_method || null,
                seller_contact_info: productData?.contact_info || null,
                incoterm: quotation.incoterm || "EXW" // Use incoterm from quotation if available
            }

            const { data: orderData, error: orderError } = await supabaseAdmin
                .from("orders")
                .insert([orderPayload])
                .select()

            if (orderError) {
                console.error("Error creating order from quotation:", orderError)

                // If the orders table doesn't exist yet, provide the SQL
                if (orderError.message.includes("relation \"orders\" does not exist")) {
                    return NextResponse.json({
                        success: false,
                        error: "La tabla 'orders' no existe. Por favor ejecute el script SQL scripts/026_create_orders_table.sql en Supabase.",
                        sqlToRun: `
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID,
    seller_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity DECIMAL NOT NULL,
    unit_price DECIMAL DEFAULT 0,
    total_price DECIMAL DEFAULT 0,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    shipping_address TEXT,
    status TEXT DEFAULT 'pending',
    origin TEXT DEFAULT 'direct',
    quotation_id UUID REFERENCES quotations(id),
    is_read_seller BOOLEAN DEFAULT false,
    is_read_buyer BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- New Fields
    category TEXT,
    origin_country TEXT,
    maturity TEXT,
    packaging_type TEXT,
    packaging_size TEXT,
    incoterm TEXT,
    certifications TEXT,
    seller_contact_method TEXT,
    seller_contact_info TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their own orders" ON orders FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Service role has full access to orders" ON orders FOR ALL USING (true);
                        `
                    }, { status: 500 })
                }

                return NextResponse.json({
                    success: false,
                    error: "Error al crear registro de pedido: " + orderError.message
                }, { status: 500 })
            } else {
                orderCreated = orderData?.[0]
                console.log("Order created from quotation:", orderCreated)
            }
        }

        return NextResponse.json({
            success: true,
            quotation: updateResult || quotation,
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
