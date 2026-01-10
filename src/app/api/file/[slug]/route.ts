import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";

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

        const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .download(onelink.fileContent.storageKey)

        if(error || !data) {
            console.error("Storage error: ", error)
            return NextResponse.json({ error: "File Not Found"}, { status: 404 })
        }

        const arrayBuffer = await data.arrayBuffer()

        return new NextResponse(arrayBuffer, {
            headers: {
                "Content-Type": onelink.fileContent.mimeType,
                "Content-Disposition": `inline; filename="${onelink.fileContent.fileName}"`,
                "Content-Length": onelink.fileContent.fileSize.toString(),
                "Cache-Control": "private, max-age=3600",
            },
        })
    } catch (error) {
        console.error("File serve error: ", error)
        return NextResponse.json({ error: "Internal Error"}, { status: 500 })
    }
}