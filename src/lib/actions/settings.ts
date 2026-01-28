"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { usernameSchema, type UsernameFormData } from "@/lib/validations/onelink"
import { strictRateLimiter, rateLimitByUser } from "@/lib/rate-limit"

type ActionResponse = {
    success: boolean
    error?: string
}

// Helper function for strict rate limit check
async function checkStrictRateLimit(userId: string): Promise<string | null> {
    try {
        const result = await rateLimitByUser(userId, strictRateLimiter)
        if (!result.success) {
            return "Too many attempts. Please wait a few minutes before trying again"
        }
        return null
    } catch (error) {
        console.error("Rate limit check failed:", error)
        return null
    }
}

export async function updateUsername(data: UsernameFormData): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        // Check rate limit (strict for username changes)
        const ratelimitError = await checkStrictRateLimit(session.user.id)
        if (ratelimitError) {
            return { success: false, error: ratelimitError }
        }

        const validated = usernameSchema.parse(data)

        // Check if the username is already taken
        const existingUser = await db.user.findUnique({
            where: { username: validated.username },
        })

        if (existingUser && existingUser.id !== session.user.id) {
            return { success: false, error: "Username is already taken" }
        }

        // Update username
        await db.user.update({
            where: { id: session.user.id },
            data: { username: validated.username }
        })

        revalidatePath("/settings")
        revalidatePath(`/${validated.username}`)

        return { success: true }
    } catch (error) {
        console.error("Update Username Error: ", error)
        return { success: false, error: "Failed to update username" }
    }
}

export async function checkUsernameAvailability(
    username: string,
): Promise<{ available: boolean }> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { available: false }
        }

        // Validate format first
        const result = usernameSchema.safeParse({ username })

        if (!result.success) {
            return { available: false }
        }

        const existingUser = await db.user.findUnique({
            where: { username: username.toLowerCase() },
        })

        // Available if no user has it, or if the current user has it
        const available = !existingUser || existingUser.id === session.user.id

        return { available }
    } catch (error) {
        return { available: false }
    }
}

export async function deleteAccount(): Promise<ActionResponse> {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, error: "You must be logged in" }
        }

        // Check rate limit (very strict for account deletion)
        const rateLimitError = await checkStrictRateLimit(session.user.id)
        if (rateLimitError) {
            return { success: false, error: rateLimitError }
        }

        // cascades to all their links
        await db.user.delete({
            where: { id: session.user.id },
        })

        return { success: true }
    } catch (error) {
        console.error("Delete Account Error: ", error)
        return { success: false, error: "Failed to delete account" }
    }
}