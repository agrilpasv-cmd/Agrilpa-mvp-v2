const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  'https://szazlttrgsgcpwqatpwx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6YXpsdHRyZ3NnY3B3cWF0cHd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA3MzA5MywiZXhwIjoyMDgxNjQ5MDkzfQ.eeUfqESDl1FP1DT-QGmm2YyV8MFf412hM7l1seD4YNw'
);

async function run() {
  // Create the table using raw SQL via the REST API
  const sql = `
    CREATE TABLE IF NOT EXISTS purchase_requests (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity TEXT NOT NULL,
      unit TEXT DEFAULT 'kg',
      desired_date DATE,
      country TEXT,
      description TEXT,
      budget TEXT,
      buyer_company TEXT,
      buyer_email TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
    CREATE INDEX IF NOT EXISTS idx_purchase_requests_user ON purchase_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_requests_category ON purchase_requests(category);
  `;

  const response = await fetch('https://szazlttrgsgcpwqatpwx.supabase.co/rest/v1/rpc/exec_sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6YXpsdHRyZ3NnY3B3cWF0cHd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA3MzA5MywiZXhwIjoyMDgxNjQ5MDkzfQ.eeUfqESDl1FP1DT-QGmm2YyV8MFf412hM7l1seD4YNw',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6YXpsdHRyZ3NnY3B3cWF0cHd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA3MzA5MywiZXhwIjoyMDgxNjQ5MDkzfQ.eeUfqESDl1FP1DT-QGmm2YyV8MFf412hM7l1seD4YNw',
    },
    body: JSON.stringify({ query: sql }),
  });

  // Fallback: try using Supabase SQL editor API
  if (!response.ok) {
    console.log('RPC not available, trying direct SQL endpoint...');
    
    const sqlResponse = await fetch('https://szazlttrgsgcpwqatpwx.supabase.co/pg/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6YXpsdHRyZ3NnY3B3cWF0cHd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA3MzA5MywiZXhwIjoyMDgxNjQ5MDkzfQ.eeUfqESDl1FP1DT-QGmm2YyV8MFf412hM7l1seD4YNw',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6YXpsdHRyZ3NnY3B3cWF0cHd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA3MzA5MywiZXhwIjoyMDgxNjQ5MDkzfQ.eeUfqESDl1FP1DT-QGmm2YyV8MFf412hM7l1seD4YNw',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (sqlResponse.ok) {
      console.log('Table created successfully via SQL endpoint!');
    } else {
      const errText = await sqlResponse.text();
      console.log('SQL endpoint response:', sqlResponse.status, errText);
      console.log('\n⚠️  Please run the migration SQL manually in the Supabase Dashboard SQL Editor.');
      console.log('File: supabase/migrations/20260508_create_purchase_requests.sql');
    }
  } else {
    console.log('Table created successfully via RPC!');
  }

  // Verify: Try to query the table
  const { data, error } = await sb.from('purchase_requests').select('id').limit(1);
  if (error) {
    console.log('Table verification failed:', error.message);
    console.log('\n⚠️  Please run the SQL migration manually in your Supabase Dashboard > SQL Editor');
  } else {
    console.log('✅ Table purchase_requests exists and is accessible!');
  }
}

run().catch(console.error);
