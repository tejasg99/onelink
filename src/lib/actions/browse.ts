"use server"

import { db } from "@/lib/db"
import { OneLinkType } from "../../../generated/prisma/client"
import {
    PaginationParams,
    PaginatedResult,
    calculatePagination
} from "@/lib/pagination"

export type BrowseOneLink = {
    id: string
    slug: string
    title: string | null
    type: OneLinkType
    viewCount: number
    createdAt: Date
    expiresAt: Date | null
    user: {
        name: string | null
        image: string | null
        username: string | null
    } | null
    _preview?: string // Optional preview text for text/code content
}

export type BrowseFilters = {
    type?: OneLinkType | "ALL"
    sortBy?: "recent" | "popular"
}

export async function getPublicOneLinks(
    pagination: PaginationParams,
    filters: BrowseFilters = {}
): Promise<PaginatedResult<BrowseOneLink>> {
    const { page, limit } = pagination
    const { type = "ALL", sortBy = "recent" } = filters

    // Build where clause
    const where = {
        visibility: "PUBLIC" as const,
        OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
        ],
        ...(type !== "ALL" && { type }),
    }

    // Build orderBy clause
    const orderBy = sortBy === "popular"
    ? { viewCount: "desc" as const }
    : { createdAt: "desc" as const }

    // Get total count for pagination
    const totalCount = await db.oneLink.count({ where })

    // Get paginated results
    const onelinks = await db.oneLink.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
            id: true,
            slug: true,
            title: true,
            type: true,
            viewCount: true,
            createdAt: true,
            expiresAt: true,
            user: {
                select: {
                    name: true,
                    image: true,
                    username: true,
                },
            },
            textContent: {
                select: {
                    content: true,
                },
            },
            codeContent: {
                select: {
                    content: true,
                    language: true,
                },
            },
            fileContent: {
                select: {
                    fileName: true,
                    fileSize: true,
                },
            },
            _count: {
                select: {
                    bioLinks: true,
                },
            },
        }
    })

    // Transform results with preview
    const data: BrowseOneLink[] = onelinks.map((link) => {
        let _preview: string | undefined

        if(link.type === "TEXT" && link.textContent) {
            // Get first 150 characters of text content
            _preview = link.textContent.content.substring(0, 150)
            if (link.textContent.content.length > 150) {
                _preview += "..."
            }
        } else if (link.type === "CODE" && link.codeContent) {
            // Get first 150 characters of code with language
            _preview = `${link.codeContent.language}: ${link.codeContent.content.substring(0, 100)}`
            if (link.codeContent.content.length > 100) {
                _preview += "..."
            }
        } else if (link.type === "FILE" && link.fileContent) {
            _preview = link.fileContent.fileName
        } else if (link.type === "LINKS") {
            _preview = `${link._count.bioLinks} links`
        }

        return {
            id: link.id,
            slug: link.slug,
            title: link.title,
            type: link.type,
            viewCount: link.viewCount,
            createdAt: link.createdAt,
            expiresAt: link.expiresAt,
            user: link.user,
            _preview,
        }
    })

    return {
        data,
        pagination: calculatePagination(page, limit, totalCount),
    }
}