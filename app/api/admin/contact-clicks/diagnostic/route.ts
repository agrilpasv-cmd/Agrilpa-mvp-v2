import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
        )

        // 1. Check if table exists and count rows
        const { data: countData, error: countError } = await supabaseAdmin
            .from("product_contact_clicks")
            .select("id")
            .limit(1)

        const { count, error: totalError } = await supabaseAdmin
            .from("product_contact_clicks")
            .select("*", { count: 'exact', head: true })

        // 2. Try a dummy insert
        const { data: insertData, error: insertError } = await supabaseAdmin
            .from("product_contact_clicks")
            .insert([
                {
                    product_id: "diagnostic-test",
                    product_title: "Diagnostic Test",
                    seller_id: "diagnostic-seller",
                    click_type: "test",
                    created_at: new Date().toISOString()
                }
            ])
            .select()

        return NextResponse.json({
            tableExists: !countError,
            countError: countError?.message,
            totalRows: count,
            totalError: totalError?.message,
            testInsert: insertData?.[0],
            insertError: insertError?.message,
            env: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            }
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
