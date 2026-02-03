import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get("email")
        const phone = searchParams.get("phone")

        if (!email && !phone) {
            return NextResponse.json(
                { success: false, error: "Se requiere email o teléfono" },
                { status: 400 }
            )
        }

        let query = supabaseAdmin
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false })

        if (email) {
            query = query.eq("buyer_email", email)
        } else if (phone) {
            query = query.ilike("buyer_phone", `%${phone}%`)
        }

        const { data, error } = await query

        if (error) {
            console.error("Error fetching orders:", error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, orders: data || [] })
    } catch (error) {
        console.error("Error in get-buyer-orders:", error)
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        )
    }
}
