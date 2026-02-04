import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log("--- DEBUGGING QUOTATIONS ---")

    // 1. Get all users
    const { data: users, error: userError } = await supabase.from("users").select("id, email, full_name")
    if (userError) console.error("User Error:", userError)
    else {
        console.log(`Found ${users.length} users:`)
        users.forEach(u => console.log(` - ${u.email} (${u.id})`))
    }

    // 2. Get all quotations
    const { data: quotes, error: quoteError } = await supabase.from("quotations").select("*")
    if (quoteError) console.error("Quote Error:", quoteError)
    else {
        console.log(`Found ${quotes.length} quotations:`)
        quotes.forEach(q => {
            console.log(` - Quote [${q.id}] Status: "${q.status}" Seller: ${q.seller_id} Product: ${q.product_title}`)
        })
    }

    // 3. Match Logic
    if (users && quotes) {
        users.forEach(u => {
            const pending = quotes.filter(q => q.seller_id === u.id && q.status?.toLowerCase() === 'pending')
            console.log(`User ${u.email} should have ${pending.length} pending quotations.`)
        })
    }
}

main()
