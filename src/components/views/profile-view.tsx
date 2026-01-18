import { BioLink } from "../../../generated/prisma/client"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"

interface ProfileViewProps {
    user: {
        name: string | null
        username: string | null
        image: string | null
    }
    links: BioLink[]
    title?: string | null
}

export function ProfileView({ user, links, title }: ProfileViewProps) {
    const displayName = title || user.name || user.username || "My Links"

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-linear-to-b from-muted/50 to-background px-4 py-12">
            <div className="mx-auto max-w-md">
                {/* Profile header */}
                <div className="mb-8 text-center">
                    <Avatar className="mx-auto mb-4 h-24 w-24 ring-4 ring-background shadow-xl">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""}/>
                        <AvatarFallback className="text-3xl bg-muted">
                            {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    {user.username && (
                        <p className="mt-1 text-muted-foreground">@{user.username}</p>
                    )}
                </div>

                {/* Links */}
                {links.length > 0 ? (
                    <div className="space-y-3">
                        {links.map((link) => (
                            <a 
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4 transition-all hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-3">
                                    {link.icon && (
                                        <span className="text-xl">{link.icon}</span>
                                    )}
                                    <span className="font-medium">{link.title}</span>
                                </div>
                                <Icons.externalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
                            </a>
                        ))}
                    </div>
                ): (
                    <div className="rounded-xl border border-dashed border-border py-12 text-center">
                        <Icons.links className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No links added yet</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                    >
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
                            <Icons.link className="h-3 w-3 text-background" />
                        </div>
                        Create your link
                    </Link>
                </div>
            </div>
        </div>
    )
}