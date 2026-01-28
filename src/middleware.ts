import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})


// Create rate limiter for middleware
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
    analytics: true,
    prefix: "ratelimit:middleware",
})

// Paths that should be rate limited
const ratelimitedPaths = [
    "/api/",
    "/s/",
    "/browse",
]

// Paths that should have stricter limits
const strictPaths = [
    "/api/upload",
    "/api/auth",
]

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Skip rate limiting for static files and internal next.js paths
    if (
        path.startsWith("/_next") ||
        path.startsWith("/static") ||
        path.includes(".") // files with extensions
    ) {
        return NextResponse.next()
    }

    // Check if path should be rate limited
    const shouldRateLimit = ratelimitedPaths.some((p) => path.startsWith(p))

    if (!shouldRateLimit) {
        return NextResponse.next()
    }

    // Get client IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "anonymous"

    // Use stricter limits for sensitive paths
    const isStrictPath = strictPaths.some((p) => path.startsWith(p))
    const identifier = isStrictPath ? `strict:${ip}` : `general:${ip}`

    try {
        const { success, limit, remaining, reset } = await ratelimit.limit(identifier)

        // Add rate limit headers to response
        const response = success
            ? NextResponse.next()
            : NextResponse.json(
                {
                    error: "Too many requests",
                    message: "Please slow down and try again"
                },
                { status: 429 }
            )

        response.headers.set("X-RateLimit-Limit", limit.toString())
        response.headers.set("X-RateLimit-Remaining", remaining.toString())
        response.headers.set("X-RateLimit-Reset", reset.toString())

        if (!success) {
            response.headers.set("Retry-After", Math.ceil((reset - Date.now()) / 1000).toString())
        }

        return response
    } catch (error) {
        // If rate limiting fails, allow the request (fail open)
        console.error("Rate limiting error:", error)
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        /*
        * Match all request paths except:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - public folder
        */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
}