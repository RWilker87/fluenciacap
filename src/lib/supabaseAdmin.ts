import { createClient } from '@supabase/supabase-js';

// ⚠️  Esta instância usa a SERVICE ROLE KEY.
//    Ela só deve ser usada em API Routes (server-side).
//    NUNCA importe este arquivo em componentes do cliente.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
