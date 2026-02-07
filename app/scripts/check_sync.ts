
import { createClient } from '@supabase/supabase-js';
import { syncAllProducts } from '@/lib/sync/products';

// Env vars are expected to be loaded before running this script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Make sure to load .env.local before running.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Checking for connected Nuvemshop stores...');

    const { data: stores, error } = await supabase
        .from('nuvemshop_stores')
        .select('*');

    if (error) {
        console.error('Error fetching stores:', error);
        return;
    }

    if (!stores || stores.length === 0) {
        console.log('No stores connected. Please authenticate via the web app first.');
        return;
    }

    console.log(`Found ${stores.length} store(s). Starting sync...`);

    for (const store of stores) {
        console.log(`Syncing store: ${store.store_name || store.store_id} (${store.store_id})`);
        try {
            await syncAllProducts(store.store_id, store.access_token);
            console.log(`Sync completed for store ${store.store_id}`);
        } catch (err) {
            console.error(`Error syncing store ${store.store_id}:`, err);
        }
    }
}

main();
