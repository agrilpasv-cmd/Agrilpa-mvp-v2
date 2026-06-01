import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

async function checkTable() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('orders').select('*', { count: 'exact', head: true }).limit(1)
    if (error) {
        console.log("Table 'orders' does not exist or error:", error.message)
    } else {
        console.log("Table 'orders' exists!")
    }
}

checkTable()
