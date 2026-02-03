
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
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
    auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
    console.log('Fetching users...');

    // 1. Check Auth Users
    const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers({
        page: 1,
        perPage: 10,
        sortBy: { field: 'created_at', direction: 'desc' }
    });

    // 2. Check Public Profiles
    const { data: profiles, error: profileError } = await adminClient
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    const output = {
        authUsers: authUsers || [],
        publicProfiles: profiles || [],
        errors: {
            auth: authError?.message || null,
            profile: profileError?.message || null
        }
    };

    fs.writeFileSync('users_dump.json', JSON.stringify(output, null, 2));
    console.log('Done.');
}

main();
