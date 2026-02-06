import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { productId, productTitle, sellerId, clickType, userId } = body
        console.log("[Tracking API] Received click:", { productId, productTitle, sellerId, clickType, userId })

        const finalProductId = String(productId || "unknown")
        const finalSellerId = String(sellerId || productId || "unknown")

        if (!productId || !clickType) {
            console.warn("[Tracking API] Missing critical fields:", { productId, clickType })
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        console.log("[Tracking API] Inserting into Supabase...")
        const { data, error } = await supabaseAdmin
            .from("product_contact_clicks")
            .insert([
                {
                    product_id: finalProductId,
                    product_title: productTitle || "Producto sin título",
                    seller_id: finalSellerId,
                    click_type: clickType,
                    user_id: userId || null,
                    created_at: new Date().toISOString()
                }
            ])
            .select()

        if (error) {
            console.error("[Tracking API] Supabase error:", error)

            // If table doesn't exist, we need to provide the SQL
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
                return NextResponse.json({
                    error: "Table not found. Please create it in Supabase.",
                    status: 500,
                    sqlToRun: `
CREATE TABLE IF NOT EXISTS public.product_contact_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  product_title TEXT,
  seller_id TEXT NOT NULL,
  click_type TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.product_contact_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact clicks" ON public.product_contact_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all contact clicks" ON public.product_contact_clicks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
`
                }, { status: 500 })
            }

            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log("[Tracking API] Success! Record ID:", data[0]?.id)
        return NextResponse.json({ success: true, trackingId: data[0]?.id })

    } catch (error: any) {
        console.error("[Tracking API] Internal error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
