import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateUploadUrl } from "@/lib/supabase"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if(!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { fileName, fileSize, mimeType } = body

        // Validate file size
        if(fileSize > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size must be less than 20 MB"},
                { status: 400 }
            )
        }

        // Validate file name
        if(!fileName || typeof fileName !== "string") {
            return NextResponse.json(
                { error: "Invalid file name"},
                { status: 400 }
            )
        }

        // Generate signed upload url
        const result = await generateUploadUrl(session.user.id, fileName)

        if(!result) {
            return NextResponse.json(
                { error: "Failed to generate upload URL"},
                { status: 500 }
            )
        }

        return NextResponse.json({
            signedUrl: result.signedUrl,
            path: result.path,
        })
    } catch (error) {
        console.error("Upload URL generation error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}