require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("Fetching a product from DB to test chat API...");
  const { data: products, error: pError } = await supabase.from('user_products').select('*').limit(1);
  if (pError || !products.length) {
    console.error("No products found to test.", pError);
    return;
  }
  const product = products[0];
  
  console.log(`Product found: ${product.title} (Vendor: ${product.user_id})`);
  
  console.log("Fetching a buyer (different from vendor if possible)...");
  const { data: users, error: uError } = await supabase.from('users').select('*').neq('id', product.user_id).limit(1);
  if (uError || !users.length) {
    console.error("No other users found to act as buyer.");
    return;
  }
  const buyer = users[0];
  
  console.log(`Buyer found: ${buyer.email} (ID: ${buyer.id})`);
  
  console.log("--- Sending POST request to API ---");
  const payload = {
    productId: product.id,
    sellerId: product.user_id,
    buyerId: buyer.id,
    senderId: buyer.id,
    content: "¡Hola! Estoy probando el nuevo sistema de mensajería desde el script automatizado. ¿Me confirmas si recibiste el correo de notificación?"
  };

  try {
    const response = await fetch('http://localhost:3000/api/chat/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log("API Response:", result);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

runTest();
