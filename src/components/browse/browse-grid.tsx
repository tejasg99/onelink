import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import { formatRelativeTime } from "@/lib/utils"
import { type BrowseOneLink } from "@/lib/actions/browse"

interface BrowseGridProps {
    items: BrowseOneLink[]
}

const typeConfig = {
    TEXT: {
        icon: Icons.text,
        label: "Text",
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    CODE: {
        icon: Icons.code,
        label: "Code",
        color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    FILE: {
        icon: Icons.file,
        label: "File",
        color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    LINKS: {
        icon: Icons.links,
        label: "Links",
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
}

export function BrowseGrid({ items }: BrowseGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
                const config = typeConfig[item.type]
                const TypeIcon = config.icon

                return (
                    <Link
                        key={item.id}
                        href={`/s/${item.slug}`}
                        className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-lg"
                    >
                        {/* Header */}
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color}`}>
                                    <TypeIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate font-medium group-hover:text-foreground">
                                        {item.title || `Untitled ${config.label.toLowerCase()}`}
                                    </h3>
                                    <Badge variant="secondary" className={`mt-1 text-xs ${config.color}`}>
                                        {config.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        {item._preview && (
                            <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground font-mono">
                                {item._preview}
                            </p>
                        )}

                        {/* Footer */}
                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                            {/* Author */}
                            <div className="flex items-center gap-2">
                                {item.user ? (
                                    <>
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={item.user.image ?? undefined} />
                                            <AvatarFallback className="text-xs">
                                                {item.user.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                            {item.user.name || item.user.username || "Anonymous"}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Anonymous</span>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Icons.eye className="h-3.5 w-3.5" />
                                    {item.viewCount}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Icons.clock className="h-3.5 w-3.5" />
                                    {formatRelativeTime(item.createdAt)}
                                </span>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
