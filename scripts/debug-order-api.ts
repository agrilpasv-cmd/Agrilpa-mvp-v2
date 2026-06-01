import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log("--- DEBUGGING ORDER DETAIL API ---")

    // 1. Fetch latest order
    const { data: latestOrder } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

    if (!latestOrder) {
        console.log("No orders found.")
        return
    }

    console.log("Testing with latest Order ID:", latestOrder.id)
    console.log("Raw DB Record:", latestOrder)

    // 2. Simulate API Logic (from api/user/orders/[id])
    // We need to see how the API transforms this data.
    // Since we can't run nextjs api directly here easily without mocking, we'll just check if key fields exist.

    console.log("\n--- FIELD CHECK ---")
    console.log("quantity (for quantity_kg):", latestOrder.quantity)
    console.log("total_price (for price_usd):", latestOrder.total_price)
    console.log("product_name:", latestOrder.product_name)
    console.log("buyer_name:", latestOrder.buyer_name)

    if (latestOrder.origin === 'quotation') {
        console.log("\n[!] This is a QUOTATION order.")
        if (!latestOrder.quantity || !latestOrder.total_price) {
            console.warn("[WARN] Missing quantity or price which might break the UI math.")
        }
    }
}

main()
