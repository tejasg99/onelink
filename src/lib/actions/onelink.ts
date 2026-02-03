"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import {
    textSchema,
    codeSchema,
    linksSchema,
    editTextSchema,
    editCodeSchema,
    editFileSchema,
    editLinksSchema,
    type TextFormData,
    type CodeFormData,
    type LinksFormData,
    type EditTextFormData,
    type EditCodeFormData,
    type EditFileFormData,
    type EditLinksFormData,
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

// Helper function to calculate new expiry date
function calculateExpiryDate(
    expiresIn: string,
    currentExpiresAt: Date | null
): Date | null {
    if (expiresIn === "keep") {
        return currentExpiresAt
    }
    return getExpiryDate(expiresIn)
}

// Helper function to verify ownership

async function verifyOwnership(
    linkId: string,
    userId: string
): Promise<{ success: boolean; error?: string; link?: any }> {
    const link = await db.oneLink.findUnique({
        where: { id: linkId },
        include: {
            textContent: true,
            codeContent: true,
            fileContent: true,
            bioLinks: true,
        }
    })

    if (!link) {
        return { success: false, error: "Link not found" }
    }

    if (link.userId !== userId) {
        return { success: false, error: "You don't have permission to edit this link" }
    }

    return { success: true, link }
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

// Edit Text OneLink
export async function editTextOneLink(
    data: EditTextFormData
): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        const rateLimitError = await checkActionRateLimit(session.user.id)

        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const validated = editTextSchema.parse(data)

        // verify ownership
        const ownership = await verifyOwnership(validated.id, session.user.id)

        if (!ownership.success) {
            return { success: false, error: ownership.error }
        }

        const link = ownership.link

        // verify link type
        if (link.type !== "TEXT") {
            return { success: false, error: "Invalid link type" }
        }

        const expiresAt = calculateExpiryDate(validated.expiresIn, link.expiresAt)

        // update link and content
        await db.$transaction([
            db.oneLink.update({
                where: { id: validated.id },
                data: {
                    title: validated.title,
                    visibility: validated.visibility,
                    expiresAt,
                    updatedAt: new Date()
                },
            }),
            db.textContent.update({
                where: { onelinkId: validated.id },
                data: {
                    content: validated.content,
                    updatedAt: new Date(),
                },
            }),
        ])

        revalidatePath("/dashboard")
        revalidatePath(`/s/${link.slug}`)
        revalidatePath(`/edit/${link.slug}`)

        return { success: true, slug: link.slug }
    } catch (error) {
        console.error("Edit text error:", error)
        return { success: false, error: "Failed to update link" }
    }
}

// Edit code OneLink
export async function editCodeOneLink(
    data: EditCodeFormData
): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        const rateLimitError = await checkActionRateLimit(session.user.id)

        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const validated = editCodeSchema.parse(data)

        // Verify ownership
        const ownership = await verifyOwnership(validated.id, session.user.id)

        if (!ownership.success) {
            return { success: false, error: ownership.error }
        }

        const link = ownership.link

        // Verify link type
        if (link.type !== "CODE") {
            return { success: false, error: "Invalid link type" }
        }

        const expiresAt = calculateExpiryDate(validated.expiresIn, link.expiresAt)

        // Update link and content
        await db.$transaction([
            db.oneLink.update({
                where: { id: validated.id },
                data: {
                    title: validated.title,
                    visibility: validated.visibility,
                    expiresAt,
                    updatedAt: new Date(),
                },
            }),
            db.codeContent.update({
                where: { onelinkId: validated.id },
                data: {
                    content: validated.content,
                    language: validated.language,
                    updatedAt: new Date(),
                },
            }),
        ])

        revalidatePath("/dashboard")
        revalidatePath(`/s/${link.slug}`)
        revalidatePath(`/edit/${link.slug}`)

        return { success: true, slug: link.slug }
    } catch (error) {
        console.error("Edit code error:", error)
        return { success: false, error: "Failed to update link" }
    }
}

// Edit File OneLink (metadata only)
export async function editFileOneLink(
    data: EditFileFormData
): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        const rateLimitError = await checkActionRateLimit(session.user.id)
        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const validated = editFileSchema.parse(data)

        // Verify ownership
        const ownership = await verifyOwnership(validated.id, session.user.id)
        if (!ownership.success) {
            return { success: false, error: ownership.error }
        }

        const link = ownership.link

        // Verify link type
        if (link.type !== "FILE") {
            return { success: false, error: "Invalid link type" }
        }

        const expiresAt = calculateExpiryDate(validated.expiresIn, link.expiresAt)

        // Update link metadata only
        await db.oneLink.update({
            where: { id: validated.id },
            data: {
                title: validated.title,
                visibility: validated.visibility,
                expiresAt,
                updatedAt: new Date(),
            },
        })

        revalidatePath("/dashboard")
        revalidatePath(`/s/${link.slug}`)
        revalidatePath(`/edit/${link.slug}`)

        return { success: true, slug: link.slug }
    } catch (error) {
        console.error("Edit file error:", error)
        return { success: false, error: "Failed to update link" }
    }
}

// Edit links OneLink
export async function editLinksOneLink(
    data: EditLinksFormData
): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        const rateLimitError = await checkActionRateLimit(session.user.id)
        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        const validated = editLinksSchema.parse(data)

        // Verify ownership
        const ownership = await verifyOwnership(validated.id, session.user.id)

        if (!ownership.success) {
            return { success: false, error: ownership.error }
        }

        const link = ownership.link

        // Verify link type
        if (link.type !== "LINKS") {
            return { success: false, error: "Invalid link type" }
        }

        const expiresAt = calculateExpiryDate(validated.expiresIn, link.expiresAt)

        // Update link and replace all bio links
        await db.$transaction([
            // Update main link
            db.oneLink.update({
                where: { id: validated.id },
                data: {
                    title: validated.title,
                    visibility: validated.visibility,
                    expiresAt,
                    updatedAt: new Date(),
                },
            }),
            // Delete existing bio links
            db.bioLink.deleteMany({
                where: { onelinkId: validated.id },
            }),
            // Create new bio links
            db.bioLink.createMany({
                data: validated.links.map((bioLink, index) => ({
                    onelinkId: validated.id,
                    title: bioLink.title,
                    url: bioLink.url,
                    icon: bioLink.icon,
                    order: index,
                })),
            }),
        ])

        revalidatePath("/dashboard")
        revalidatePath(`/s/${link.slug}`)
        revalidatePath(`/edit/${link.slug}`)

        return { success: true, slug: link.slug }
    } catch (error) {
        console.error("Edit links error:", error)
        return { success: false, error: "Failed to update link" }
    }
}

// Get link for editing
export async function getOneLinkForEdit(slug: string) {
    try {
        const session = await auth()

        if (!session?.user) {
        return { success: false, error: "You must be logged in" }
        }

        const link = await db.oneLink.findUnique({
            where: { slug },
            include: {
                textContent: true,
                codeContent: true,
                fileContent: true,
                bioLinks: {
                    orderBy: { order: "asc" },
                },
            },
        })

        if(!link) {
            return { success: false, error: "Link not found" }
        }

        if(link.userId !== session.user.id) {
            return { success: false, error: "You don't have the permission to edit this link" }
        }

        return { success: true, link }
    } catch (error) {
        console.error("Get link for edit error:", error)
        return { success: false, error: "Failed to get link" }
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