import { createClient } from "@supabase/supabase-js";

// Server-side client with service role key (for file uploads)
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

// Bucket name for file storage
export const STORAGE_BUCKET = "onelink-files";