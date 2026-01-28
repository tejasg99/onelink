import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateSlug, getExpiryDate } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import {
    createRateLimiter,
    rateLimitByUser,
    getRateLimitHeaders
} from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check rate limit
        const rateLimitResult = await rateLimitByUser(
            session.user.id,
            createRateLimiter
        )

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: "Rate limit exceeded",
                    message: "Too many requests. Please slow down.",
                },
                {
                    status: 429,
                    headers: getRateLimitHeaders(rateLimitResult),
                }
            )
        }

        const body = await request.json()
        const {
            path,
            fileName,
            fileSize,
            mimeType,
            title,
            visibility,
            expiresIn,
        } = body

        // Validate required fields
        if (!path || !fileName || !fileSize || !mimeType) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            )
        }

        const slug = generateSlug()
        const expiresAt = getExpiryDate(expiresIn || "never")

        // Create a db record
        await db.oneLink.create({
            data: {
                slug,
                title: title || fileName,
                type: "FILE",
                visibility: visibility || "UNLISTED",
                expiresAt,
                userId: session.user.id,
                fileContent: {
                    create: {
                        fileName,
                        fileSize,
                        mimeType,
                        storageKey: path
                    },
                },
            },
        })

        revalidatePath("/dashboard")

        return NextResponse.json(
            { success: true, slug },
            { headers: getRateLimitHeaders(rateLimitResult) }
        )
    } catch (error) {
        console.error("Upload complete error:", error)
        return NextResponse.json(
            { error: "Failed to create file record" },
            { status: 500 }
        )
    }
}