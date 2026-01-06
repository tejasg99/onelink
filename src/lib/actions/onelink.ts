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

// Response type for actions
type ActionResponse = {
    success: boolean
    slug?: string
    error?: string
}

// Create Text OneLink
export async function createTextOneLink(data: TextFormData): Promise<ActionResponse> {
    try {
        const session = await auth();

        if(!session?.user) {
            return { success: false, error: "You must be logged in"}
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
        return { success: false, error: "Failed to create code link"}
    }
}

// Create File OneLink
export async function createFileOneLink(formData: FormData): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
        return { success: false, error: "You must be logged in" }
        }

        const file = formData.get("file") as File
        const title = formData.get("title") as string
        const visibility = formData.get("visibility") as "PUBLIC" | "UNLISTED"
        const expiresIn = formData.get("expiresIn") as string

        if(!file || file.size === 0) {
            return { success: false, error: "No file is provided"}
        }

        // 20MB limit
        if(file.size > 20 * 1024 * 1024) {
            return { success: false, error: "File size must be less than 20MB"}
        }

        const slug = generateSlug()
        const expiresAt = getExpiryDate(expiresIn)

        // Generate unique storage key
        const fileExt = file.name.split(".").pop()
        const storageKey = `${session.user.id}/${slug}.${fileExt}`

        // Convert file to Buffer for supabase
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(storageKey, buffer, {
            contentType: file.type,
            upsert: false,
        })

        if(uploadError) {
            console.error("Upload Error: ", uploadError)
            return { success: false, error: "Failed to upload file"}
        }

        // Create db record
        await db.oneLink.create({
            data: {
                slug,
                title: title || file.name,
                type: "FILE",
                visibility,
                expiresAt,
                userId: session.user.id,
                fileContent: {
                    create: {
                        fileName: file.name,
                        fileSize: file.size,
                        mimeType: file.type,
                        storageKey,
                    },
                },
            },
        })

        revalidatePath("/dashboard")
        return { success: true, slug }
    } catch (error) {
        console.error("Create file Link error: ", error)
        return { success: false, error: "Failed to create file link"}
    }
}

// Create Bio links OneLink
export async function createLinksOneLink(data: LinksFormData): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
        return { success: false, error: "You must be logged in" }
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
        return { success: true, slug}
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

        // Delete file from storage if exists
        if(onelink.fileContent) {
            await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .remove([onelink.fileContent.storageKey])
        }

        await db.oneLink.delete({
            where: { id }
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Delete error:", error)
        return { success: false, error: "Failed to delete link" }
    }
}

// Increment view count
export async function incrementViewCount(slug: string): Promise<void> {
    try {
        await db.oneLink.update({
            where: { slug },
            data: { viewCount: { increment: 1 }},
        })
    } catch (error) {
        console.error("View count update error: ", error)
    }
}