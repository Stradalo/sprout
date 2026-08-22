import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS entirely.
// Only ever import this from server code (Server Actions / Server Components).
// It must never be reachable from a "use client" module, and the key it reads
// must never be given a NEXT_PUBLIC_ prefix.
export default function createAdminClient() {
    const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        }
    )

    return admin
}
