
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
            process.env[key] = value;
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function main() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);

    // 1. Test Auth Admin
    try {
        const { data: { users }, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
        if (error) {
            console.error('Error listing auth users:', error.message);
        } else {
            console.log('Success: Listed auth users. Count:', users.length);
        }
    } catch (err) {
        console.error('Exception testing auth:', err);
    }

    // 2. Test Public Table Access (users)
    try {
        const { count, error } = await adminClient.from('users').select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Error accessing public.users:', error.message);
        } else {
            console.log('Success: Accessed public.users. Count:', count);
        }
    } catch (err) {
        console.error('Exception testing public table:', err);
    }
}

main();
