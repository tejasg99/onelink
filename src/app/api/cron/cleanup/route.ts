import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase"

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return false

  const token = authHeader.replace("Bearer ", "")
  return token === process.env.CRON_SECRET
}

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  if (process.env.NODE_ENV === "production" && !verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("[Cron] Starting expired links cleanup...")

    // Find all expired links
    const expiredLinks = await db.oneLink.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
      include: {
        fileContent: true,
      },
    })

    console.log(`[Cron] Found ${expiredLinks.length} expired links`)

    // Delete files from storage
    const fileKeys = expiredLinks
      .filter((link) => link.fileContent)
      .map((link) => link.fileContent!.storageKey)

    if (fileKeys.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .remove(fileKeys)

      if (storageError) {
        console.error("[Cron] Storage deletion error:", storageError)
      } else {
        console.log(`[Cron] Deleted ${fileKeys.length} files from storage`)
      }
    }

    // Delete expired links from database (cascade deletes content)
    const deleteResult = await db.oneLink.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    console.log(`[Cron] Deleted ${deleteResult.count} expired links from database`)

    return NextResponse.json({
      success: true,
      deleted: deleteResult.count,
      filesDeleted: fileKeys.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Cron] Cleanup error:", error)
    return NextResponse.json(
      { error: "Cleanup failed", details: String(error) },
      { status: 500 }
    )
  }
}