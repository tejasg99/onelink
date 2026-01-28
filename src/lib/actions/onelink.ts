"use server";

import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import {
    textSchema,
    codeSchema,
    linksSchema,
    type TextFormData,
    type CodeFormData,
    type LinksFormData,
} from "@/lib/validations/onelink";
import { generateSlug, getExpiryDate } from "@/lib/utils";
import { createRateLimiter, rateLimitByUser } from "@/lib/rate-limit"

// Response type for actions
type ActionResponse = {
    success: boolean
    slug?: string
    error?: string
}

// helper function to check rate limit in server actions
async function checkActionRateLimit(userId: string): Promise<string | null> {
    try {
        const result = await rateLimitByUser(userId, createRateLimiter)
        if (!result.success) {
            return "Rate limit exceeded. Please slow down and try again"
        }
        return null
    } catch (error) {
        // If rate limiting fails, allow the request(fail open)
        console.error("Rate limit check failed: ", error)
        return null
    }
}

// Create Text OneLink
export async function createTextOneLink(data: TextFormData): Promise<ActionResponse> {
    try {
        const session = await auth();

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        // Check rate limit
        const rateLimitError = await checkActionRateLimit(session.user.id)
        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const validated = textSchema.parse(data)
        const slug = generateSlug()
        const expiresAt = getExpiryDate(validated.expiresIn)

        await db.oneLink.create({
            data: {
                slug,
                title: validated.title,
                type: "TEXT",
                visibility: validated.visibility,
                expiresAt,
                userId: session.user.id,
                textContent: {
                    create: {
                        content: validated.content,
                    },
                },
            },
        })

        revalidatePath("/dashboard");
        return { success: true, slug }
    } catch (error) {
        console.error("Create text error: ", error)
        return { success: false, error: "Failed to create text link" }
    }
}

// Create code OneLink
export async function createCodeOneLink(data: CodeFormData): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        // Check rate limit
        const rateLimitError = await checkActionRateLimit(session.user.id)
        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const validated = codeSchema.parse(data)
        const slug = generateSlug()
        const expiresAt = getExpiryDate(validated.expiresIn)

        await db.oneLink.create({
            data: {
                slug,
                title: validated.title,
                type: "CODE",
                visibility: validated.visibility,
                expiresAt,
                userId: session.user.id,
                codeContent: {
                    create: {
                        content: validated.content,
                        language: validated.language,
                    },
                },
            },
        })

        revalidatePath("/dashboard")
        return { success: true, slug }
    } catch (error) {
        console.error("Create code error: ", error)
        return { success: false, error: "Failed to create code link" }
    }
}

// Create Bio links OneLink
export async function createLinksOneLink(data: LinksFormData): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        // Check rate limit
        const rateLimitError = await checkActionRateLimit(session.user.id)
        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const validated = linksSchema.parse(data)
        const slug = generateSlug()
        const expiresAt = getExpiryDate(validated.expiresIn)

        await db.oneLink.create({
            data: {
                slug,
                title: validated.title,
                type: "LINKS",
                visibility: validated.visibility,
                expiresAt,
                userId: session.user.id,
                bioLinks: {
                    create: validated.links.map((link, index) => ({
                        title: link.title,
                        url: link.url,
                        icon: link.icon,
                        order: index,
                    })),
                },
            },
        })

        revalidatePath("/dashboard")
        return { success: true, slug }
    } catch (error) {
        console.error("Create Bio OneLink error:", error)
        return { success: false, error: "Failed to create Bio link" }
    }
}

// Delete OneLink
export async function deleteOneLink(id: string): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        // Check rate limit
        const rateLimitError = await checkActionRateLimit(session.user.id)
        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const onelink = await db.oneLink.findUnique({
            where: { id },
            include: { fileContent: true }
        })

        if (!onelink) {
            return { success: false, error: "Link not found" }
        }

        if (onelink.userId !== session.user.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Delete file from storage if exists (using service role key for admin access)
        if (onelink.fileContent) {
            const { error } = await supabaseAdmin.storage
                .from(STORAGE_BUCKET)
                .remove([onelink.fileContent.storageKey])

            if (error) {
                console.error("Failed to delete file from storage:", error)

            }
        }

        // Continue with database deletion even if storage deletion fails
        await db.oneLink.delete({
            where: { id },
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Delete error:", error)
        return { success: false, error: "Failed to delete link" }
    }
}

// Increment view count - no rate limit
export async function incrementViewCount(slug: string): Promise<void> {
    try {
        await db.oneLink.update({
            where: { slug },
            data: { viewCount: { increment: 1 } },
        })
    } catch (error) {
        console.error("View count update error: ", error)
    }
}