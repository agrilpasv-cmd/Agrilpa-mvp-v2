const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkData() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log("Checking user_products count...");
    const { count: upCount, error: upError } = await supabase
        .from('user_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_visible', true);
    
    console.log("User products (visible):", upCount);

    console.log("Checking static_products_visibility...");
    const { data: visData, error: visError } = await supabase
        .from('static_products_visibility')
        .select('*');
    
    if (visError) {
        console.error("Error fetching visibility:", visError);
    } else {
        const hidden = visData.filter(v => !v.is_visible).length;
        const visible = visData.filter(v => v.is_visible).length;
        console.log(`Static visibility: ${visible} visible, ${hidden} hidden`);
    }
}

checkData();
