import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDownloadUrl } from "@/lib/supabase";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        const onelink = await db.oneLink.findUnique({
            where: { slug },
            include: { fileContent: true }
        })

        if(!onelink || !onelink.fileContent) {
            return NextResponse.json({ error: "File Not Found"}, { status: 404 })
        }

        // Check expiry 
        if(onelink.expiresAt && new Date(onelink.expiresAt) < new Date()) {
            return NextResponse.json({ error: "Link Expired"}, { status: 410 })
        }

        // Generate signed download URL which is valid for 1 hr
        const signedUrl = await generateDownloadUrl(onelink.fileContent.storageKey, 3600)

        if(!signedUrl) {
            return NextResponse.json({ error: "Failed to generate download URL"}, { status: 500 })
        }

        // Redirect to signed URL
        return NextResponse.redirect(signedUrl)
    } catch (error) {
        console.error("File serve error: ", error)
        return NextResponse.json({ error: "Internal Error"}, { status: 500 })
    }
}