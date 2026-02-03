import { z } from "zod";

// Base schemas for common fields
const baseSchema = z.object({
    title: z.string().max(100, "Title must be less than 100 characters").optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]), // Removed .default() as RHF does not support it
    expiresIn: z.enum(["never", "1h", "24h", "7d"]),
})

// Base schema for Edit 
const baseEditSchema = z.object({
    id: z.string().min(1, "Link ID is required"),
    title: z.string().max(100, "Title must be less than 100 characters").optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]),
    expiresIn: z.enum(["never", "1h", "24h", "7d", "keep"]),
})

// Text content schema
export const textSchema = baseSchema.extend({
    type: z.literal("TEXT"),
    content: z
        .string()
        .min(1, "Content is required")
        .max(50000, "Content must be less than 50000 characters"),
})

// Code content schema
export const codeSchema = baseSchema.extend({
    type: z.literal("CODE"),
    content: z
        .string()
        .min(1, "Code is required")
        .max(50000, "Code snippet must be less than 50000 characters"),
    language: z.string(),
})

// File content schema 
export const fileSchema = baseSchema.extend({
    type: z.literal("FILE"),
})

// Bio links schema
export const bioLinkItemSchema = z.object({
    id: z.string().optional(), // For existing links during edit
    title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
    url: z.url("Please enter a valid url"),
    icon: z.string().optional(),
})

export const linksSchema = baseSchema.extend({
    type: z.literal("LINKS"),
    links: z
        .array(bioLinkItemSchema)
        .min(1, "At least one link is required")
        .max(20, "Maximum 20 links allowed"),
})

// Union schema for all types
export const createOneLinkSchema = z.discriminatedUnion("type", [
    textSchema,
    codeSchema,
    fileSchema,
    linksSchema,
])

// Edit text schema
export const editTextSchema = baseEditSchema.extend({
    type: z.literal("TEXT"),
    content: z
        .string()
        .min(1, "Content is required")
        .max(50000, "Content must be less than 50,000 characters"),
})

// Edit code schema
export const editCodeSchema = baseEditSchema.extend({
    type: z.literal("CODE"),
    content: z
        .string()
        .min(1, "Code is required")
        .max(50000, "Code must be less than 50,000 characters"),
    language: z.string(),
})

// Edit file schema (metadata only)
export const editFileSchema = baseEditSchema.extend({
    type: z.literal("FILE"),
})

// Edit links schema
export const editLinksSchema = baseEditSchema.extend({
    type: z.literal("LINKS"),
    links: z
        .array(bioLinkItemSchema)
        .min(1, "At least one link is required")
        .max(20, "Maximum 20 links allowed"),
})

// Username validation 
export const usernameSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be atleast 3 characters")
        .max(30, "Username must be less than 30 characters")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Username can only contain letters, numbers, underscores and hyphens"
        )
        .toLowerCase(),
})

// Create types
export type TextFormData = z.infer<typeof textSchema>
export type CodeFormData = z.infer<typeof codeSchema>
export type FileFormData = z.infer<typeof fileSchema>
export type LinksFormData = z.infer<typeof linksSchema>
export type CreateOneLinkData = z.infer<typeof createOneLinkSchema>
export type BiolinkItem = z.infer<typeof bioLinkItemSchema>

// Edit types
export type EditTextFormData = z.infer<typeof editTextSchema>
export type EditCodeFormData = z.infer<typeof editCodeSchema>
export type EditFileFormData = z.infer<typeof editFileSchema>
export type EditLinksFormData = z.infer<typeof editLinksSchema>

// Username type
export type UsernameFormData = z.infer<typeof usernameSchema>