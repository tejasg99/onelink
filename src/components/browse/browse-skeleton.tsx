import { Skeleton } from "@/components/ui/skeleton"

export function BrowseSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col rounded-xl border bg-card p-5"
                >
                    {/* Header */}
                    <div className="mb-3 flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="mb-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}