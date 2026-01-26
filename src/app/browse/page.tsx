import { Suspense } from "react"
import { Metadata } from "next"
import Link from "next/link"
import { getPublicOneLinks, type BrowseFilters } from "@/lib/actions/browse"
import { getPaginationParams } from "@/lib/pagination"
import {
    BrowseGrid,
    BrowseFilters as BrowseFiltersComponent,
    BrowsePagination,
    BrowseSkeleton,
} from "@/components/browse"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { OneLinkType } from "../../../generated/prisma/client"

export const metadata: Metadata = {
    title: "Browse Public Links | OneLink",
    description: "Discover public text snippets, code, files, and link collections shared by the community.",
}

interface BrowsePageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
    const params = await searchParams
    const pagination = getPaginationParams(params, 5)

    const filters: BrowseFilters = {
        type: (params.type as OneLinkType | "ALL") || "ALL",
        sortBy: (params.sortBy as "recent" | "popular") || "recent",
    }

    const result = await getPublicOneLinks(pagination, filters)

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="border-b border-border bg-muted/30">
                <div className="container mx-auto px-4 py-12">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight">
                            Browse Public Links
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Discover text snippets, code, files, and link collections shared by the community.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters & Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <BrowseFiltersComponent
                        currentType={filters.type || "ALL"}
                        currentSort={filters.sortBy || "recent"}
                    />

                    <div className="text-sm text-muted-foreground">
                        {result.pagination.totalCount.toLocaleString()} public links
                    </div>
                </div>

                {/* Results */}
                {result.data.length > 0 ? (
                    <>
                        <Suspense fallback={<BrowseSkeleton />}>
                            <BrowseGrid items={result.data} />
                        </Suspense>

                        {/* Pagination */}
                        {result.pagination.totalPages > 1 && (
                            <div className="mt-8">
                                <BrowsePagination
                                    pagination={result.pagination}
                                    filters={filters}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Icons.globe className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="mb-2 text-xl font-semibold">No public links yet</h2>
                        <p className="mb-6 text-muted-foreground">
                            Be the first to share something with the community!
                        </p>
                        <Button asChild>
                            <Link href="/new">
                                <Icons.plus className="mr-2 h-4 w-4" />
                                Create a link
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}