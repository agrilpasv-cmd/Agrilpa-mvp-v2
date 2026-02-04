import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { ids, all } = body

        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        if (all) {
            // Mark all orders where user is seller as read for seller
            const { error: sellerError } = await supabaseAdmin
                .from("orders")
                .update({ is_read_seller: true })
                .eq("seller_id", user.id)
                .eq("is_read_seller", false)

            // Mark all orders where user is buyer as read for buyer
            const { error: buyerError } = await supabaseAdmin
                .from("orders")
                .update({ is_read_buyer: true })
                .eq("buyer_id", user.id)
                .eq("is_read_buyer", false)

            if (sellerError || buyerError) throw (sellerError || buyerError)
        } else if (ids && Array.isArray(ids)) {
            // Mark specific IDs as read. We check both roles for each ID to be safe
            const { error: sellerError } = await supabaseAdmin
                .from("orders")
                .update({ is_read_seller: true })
                .in("id", ids)
                .eq("seller_id", user.id)

            const { error: buyerError } = await supabaseAdmin
                .from("orders")
                .update({ is_read_buyer: true })
                .in("id", ids)
                .eq("buyer_id", user.id)

            if (sellerError || buyerError) throw (sellerError || buyerError)
        } else {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Mark Read Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
