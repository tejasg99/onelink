import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { headers } from "next/headers"

// Create Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiters for different use cases

/**
 * General API rate limiter
 * 60 req per minute per IP
*/
export const apiRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "ratelimit:api",
})

/**
 * Authentication rate limiter
 * 10 req per minute per IP
*/
export const authRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "ratelimit:auth",
})

/**
 * Content creation rate limiter
 * 30 requests per minute per user
*/
export const createRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    analytics: true,
    prefix: "ratelimit:create",
})

/**
 * File upload rate limiter (stricter due to resource usage)
 * 10 uploads per hour per user
*/
export const uploadRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "ratelimit:upload",
})

/**
 * Browse/public endpoints rate limiter
 * 100 requests per minute per IP
*/
export const browseRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:browse"
})

/**
 * Strict rate limiter for sensitive operations
 * 5 requests per minute per IP
*/
export const strictRateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "ratelimit:strict",
})


// Helper functions

/**
 * Get client IP address from headers
*/
export async function getClientIP(): Promise<string> {
    const headersList = await headers()

    // Try various headers (Vercel, Cloudflare, etc.)
    const forwardedFor = headersList.get("x-forwarded-for")

    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim()
    }

    const realIP = headersList.get("x-real-ip")

    if (realIP) {
        return realIP
    }

    // Fallback
    return "anonymous"
}

/**
 * Rate limit result type
*/
export type RateLimitResult = {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

/**
 * Check rate limit and return result
*/
export async function checkRateLimit(
    limiter: Ratelimit,
    identifier: string
): Promise<RateLimitResult> {
    const result = await limiter.limit(identifier)

    return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
    }
}

/**
 * Get rate limit headers for response
*/
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
    return {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString(),
    }
}

/**
 * Combined helper: Check rate limit by IP
*/
export async function rateLimit(
    limiter: Ratelimit = apiRateLimiter
): Promise<RateLimitResult> {
    const ip = await getClientIP()
    return checkRateLimit(limiter, ip)
}

/**
 * Combined helper: Check rate limit by user ID
*/
export async function rateLimitByUser(
    userId: string,
    limiter: Ratelimit = createRateLimiter
): Promise<RateLimitResult> {
    return checkRateLimit(limiter, `user:${userId}`)
}