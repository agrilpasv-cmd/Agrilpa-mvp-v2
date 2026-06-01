const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://szazlttrgsgcpwqatpwx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6YXpsdHRyZ3NnY3B3cWF0cHd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA3MzA5MywiZXhwIjoyMDgxNjQ5MDkzfQ.eeUfqESDl1FP1DT-QGmm2YyV8MFf412hM7l1seD4YNw'
);

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}

test();
