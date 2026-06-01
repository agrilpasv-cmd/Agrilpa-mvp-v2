import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log("--- DEBUGGING ORDERS ---")

    // 1. Get all users to map IDs
    const { data: users } = await supabase.from("users").select("id, email")

    // 2. Get all orders
    const { data: orders, error } = await supabase.from("orders").select("*")

    if (error) {
        console.error("Error fetching orders:", error)
        return
    }

    console.log(`Found ${orders.length} orders:`)
    orders.forEach(o => {
        const seller = users?.find(u => u.id === o.seller_id)
        console.log(`Order [${o.id}] Seller: ${seller?.email || o.seller_id}`)
        console.log(` - Status: ${o.status}`)
        console.log(` - Is Read Seller: ${o.is_read_seller}`)
        console.log(` - Origin: ${o.origin}`)
    })
}

main()
