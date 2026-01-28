import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDownloadUrl } from "@/lib/supabase";
import {
    browseRateLimiter,
    rateLimit,
    getRateLimitHeaders,
} from "@/lib/rate-limit"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Check rate limit
        const rateLimitResult = await rateLimit(browseRateLimiter)

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    message: "Too many requests. Please try again later",
                },
                {
                    status: 429,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            )
        }

        const { slug } = await params

        const onelink = await db.oneLink.findUnique({
            where: { slug },
            include: { fileContent: true }
        })

        if (!onelink || !onelink.fileContent) {
            return NextResponse.json(
                { error: "File Not Found" },
                { status: 404, headers: getRateLimitHeaders(rateLimitResult) }
            )
        }

        // Check expiry 
        if (onelink.expiresAt && new Date(onelink.expiresAt) < new Date()) {
            return NextResponse.json(
                { error: "Link Expired" },
                { status: 410, headers: getRateLimitHeaders(rateLimitResult) }
            )
        }

        // Generate signed download URL which is valid for 1 hr
        const signedUrl = await generateDownloadUrl(onelink.fileContent.storageKey, 3600)

        if (!signedUrl) {
            return NextResponse.json(
                { error: "Failed to generate download URL" },
                { status: 500, headers: getRateLimitHeaders(rateLimitResult) }
            )
        }

        // Redirect to signed URL
        return NextResponse.redirect(signedUrl, {
            headers: getRateLimitHeaders(rateLimitResult),
        })
    } catch (error) {
        console.error("File serve error: ", error)
        return NextResponse.json({ error: "Internal Error" }, { status: 500 })
    }
}