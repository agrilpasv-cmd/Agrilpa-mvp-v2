
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
            const value = match[2].trim().replace(/^['"]|['"]$/g, '');
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
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'Password123!';

    console.log(`Attempting to create user: ${testEmail}`);

    // 1. Create Auth User
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
            full_name: 'Test User',
            user_type: 'comprador'
        }
    });

    if (authError) {
        console.error('Auth creation error:', authError);
        return;
    }

    console.log('Auth user created:', authData.user.id);

    // 2. Create Profile
    const { error: profileError } = await adminClient.from("users").insert({
        id: authData.user.id,
        email: testEmail,
        full_name: 'Test User',
        company_name: 'Test Company',
        user_type: 'comprador',
        role: 'user'
    });

    if (profileError) {
        console.error('Profile creation error:', profileError);
        // Cleanup
        await adminClient.auth.admin.deleteUser(authData.user.id);
    } else {
        console.log('Profile created successfully in public.users');
    }
}

main();
