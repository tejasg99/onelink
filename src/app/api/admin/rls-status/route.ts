import { NextRequest, NextResponse } from "next/server"
import { verifyRLSStatus } from "@/lib/verify-rls"

// Only allow in development or with admin secret
function isAuthorized(request: NextRequest): boolean {
    if (process.env.NODE_ENV === "development") return true

    const authHeader = request.headers.get("authorization")
    if (!authHeader) return false

    const token = authHeader.replace("Bearer ", "")
    return token === process.env.ADMIN_SECRET
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const status = await verifyRLSStatus()

        return NextResponse.json({
            success: true,
            ...status,
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        console.error("RLS status check error:", error)
        return NextResponse.json(
            { error: "Failed to check RLS status" },
            { status: 500 }
        )
    }
}