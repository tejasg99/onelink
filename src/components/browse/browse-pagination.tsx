"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { type BrowseFilters } from "@/lib/actions/browse"

interface PaginationInfo {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

interface BrowsePaginationProps {
    pagination: PaginationInfo
    filters: BrowseFilters
}

export function BrowsePagination({ pagination, filters }: BrowsePaginationProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createPageUrl = useCallback((page: number) => {
        const params = new URLSearchParams(searchParams.toString())

        if (page === 1) {
            params.delete("page")
        } else {
            params.set("page", page.toString())
        }

        return `/browse${params.toString() ? `?${params.toString()}` : ""}`
    }, [searchParams])

    const goToPage = (page: number) => {
        router.push(createPageUrl(page))
    }

    // Generate page numbers to show
    const getVisiblePages = () => {
        const { page, totalPages } = pagination
        const pages: (number | "ellipsis")[] = []

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            if (page > 3) {
                pages.push("ellipsis")
            }

            // Show pages around current page
            const start = Math.max(2, page - 1)
            const end = Math.min(totalPages - 1, page + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (page < totalPages - 2) {
                pages.push("ellipsis")
            }

            // Always show last page
            pages.push(totalPages)
        }
        return pages
    }

    const visiblePages = getVisiblePages()

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Page info */}
            <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                </span>{" "}
                of <span className="font-medium">{pagination.totalCount}</span> results
            </p>

            {/* Pagination controls */}
            <div className="flex items-center gap-1">
                {/* Previous button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="h-9 w-9"
                >
                    <Icons.chevronDown className="h-4 w-4 rotate-90" />
                    <span className="sr-only">Previous page</span>
                </Button>

                {/* Page numbers */}
                <div className="hidden items-center gap-1 sm:flex">
                    {visiblePages.map((page, index) => {
                        if (page === "ellipsis") {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                                >
                                    ...
                                </span>
                            )
                        }

                        const isCurrentPage = page === pagination.page

                        return (
                            <Button
                                key={page}
                                variant={isCurrentPage ? "default" : "outline"}
                                size="icon"
                                onClick={() => goToPage(page)}
                                disabled={isCurrentPage}
                                className="h-9 w-9"
                            >
                                {page}
                            </Button>
                        )
                    })}
                </div>

                {/* Mobile page indicator */}
                <span className="flex items-center px-3 text-sm text-muted-foreground sm:hidden">
                    Page {pagination.page} of {pagination.totalPages}
                </span>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                    className="h-9 w-9"
                >
                    <Icons.chevronDown className="h-4 w-4 -rotate-90" />
                    <span className="sr-only">Next page</span>
                </Button>
            </div>
        </div>
    )
}