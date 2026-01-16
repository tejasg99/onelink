"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase"

export async function cleanupExpiredLinks() {
  const session = await auth()

  // Only allow authenticated users (you could add admin check here)
  if (!session?.user) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    // Find expired links belonging to this user
    const expiredLinks = await db.oneLink.findMany({
      where: {
        userId: session.user.id,
        expiresAt: {
          lt: new Date(),
        },
      },
      include: {
        fileContent: true,
      },
    })

    // Delete files from storage
    const fileKeys = expiredLinks
      .filter((link) => link.fileContent)
      .map((link) => link.fileContent!.storageKey)

    if (fileKeys.length > 0) {
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove(fileKeys)
    }

    // Delete from database
    const result = await db.oneLink.deleteMany({
      where: {
        userId: session.user.id,
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return {
      success: true,
      deleted: result.count,
    }
  } catch (error) {
    console.error("Cleanup error:", error)
    return { success: false, error: "Cleanup failed" }
  }
}