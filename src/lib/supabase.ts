import { createClient } from "@supabase/supabase-js";

// Server-side client with service role key (for signed URLs and admin operations)
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

// Client side supabase client for direct uploads
export const createBrowserClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

// Bucket name for file storage
export const STORAGE_BUCKET = "onelink-files";

// Generate signed upload URL (Server-side only)
export async function generateUploadUrl(
    userId: string,
    fileName: string
): Promise<{ signedUrl: string; path: string} | null > {
    const fileExt = fileName.split(".").pop()
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const path = `${userId}/${uniqueName}`

    const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(path)

    if(error || !data) {
        console.error("Failed to create signed upload URL: ", error)
        return null
    }

    return {
        signedUrl: data.signedUrl,
        path,
    }
}

// Generate signed download url (server side only)
export async function generateDownloadUrl(
    path: string,
    expiresIn: number = 3600 // default 1hr
):Promise<string | null> {
    const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresIn)

    if(error || !data) {
        console.error("Failed to create signed download URL: ", error)
        return null
    }

    return data.signedUrl
}