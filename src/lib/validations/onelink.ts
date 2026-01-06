import { z } from "zod";

// Base schemas for common fields
const baseSchema  = z.object({
    title: z.string().max(100, "Title must be less than 100 characters").optional(),
    visibility: z.enum(["PUBLIC", "UNLISTED"]).default("UNLISTED"),
    expiresIn: z.enum(["never", "1h", "24h", "7d"]).default("never"),
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
    language: z.string().default("plaintext"),
})

// File content schema 
export const fileSchema = baseSchema.extend({
    type: z.literal("FILE"),
})

// Bio links schema
export const bioLinkItemSchema = z.object({
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

// Types
export type TextFormData = z.infer<typeof textSchema>
export type CodeFormData = z.infer<typeof codeSchema>
export type FileFormData = z.infer<typeof fileSchema>
export type LinksFormData = z.infer<typeof linksSchema>
export type CreateOneLinkData = z.infer<typeof createOneLinkSchema>
export type BiolinkItem = z.infer<typeof bioLinkItemSchema>