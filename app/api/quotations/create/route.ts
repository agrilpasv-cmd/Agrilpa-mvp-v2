import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            productId,
            productTitle,
            productImage,
            sellerId,
            buyerName,
            contactMethod,
            countryCode,
            phoneNumber,
            email,
            quantity,
            destinationCountry,
            estimatedDate,
            notes
        } = body

        // Validate required fields
        if (!productId || !sellerId || !buyerName || !quantity || !destinationCountry || !estimatedDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Validate contact info
        if (contactMethod === "WhatsApp" && (!countryCode || !phoneNumber)) {
            return NextResponse.json({ error: "Missing WhatsApp contact info" }, { status: 400 })
        }
        if (contactMethod === "Email" && !email) {
            return NextResponse.json({ error: "Missing email" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // First, check if the quotations table exists by trying to insert
        const { data, error } = await supabaseAdmin
            .from("quotations")
            .insert([
                {
                    product_id: productId,
                    product_title: productTitle,
                    product_image: productImage,
                    seller_id: sellerId,
                    buyer_name: buyerName,
                    contact_method: contactMethod,
                    country_code: countryCode || null,
                    phone_number: phoneNumber || null,
                    email: email || null,
                    quantity: parseInt(quantity),
                    destination_country: destinationCountry,
                    estimated_date: estimatedDate,
                    notes: notes || null,
                    status: "pending",
                    created_at: new Date().toISOString()
                }
            ])
            .select()

        if (error) {
            console.error("Error creating quotation:", error)

            // If table doesn't exist, we need to create it
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
                return NextResponse.json({
                    error: "Quotations table not found. Please create it in Supabase.",
                    sqlToRun: `
CREATE TABLE quotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL,
    product_title TEXT,
    product_image TEXT,
    seller_id UUID NOT NULL,
    buyer_name TEXT NOT NULL,
    contact_method TEXT NOT NULL,
    country_code TEXT,
    phone_number TEXT,
    email TEXT,
    quantity INTEGER NOT NULL,
    destination_country TEXT NOT NULL,
    estimated_date DATE NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to do everything
CREATE POLICY "Service role can manage quotations" ON quotations FOR ALL USING (true);
                    `
                }, { status: 500 })
            }

            return NextResponse.json({ error: "Failed to create quotation", details: error.message }, { status: 500 })
        }

        console.log("Quotation created successfully:", data)

        return NextResponse.json({ success: true, quotation: data[0] })

    } catch (error) {
        console.error("Error in create-quotation:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
