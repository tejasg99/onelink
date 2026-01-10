import { OneLink, BioLink } from "../../../generated/prisma/client"
import { Icons } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface LinksViewProps {
  onelink: OneLink & { user: { name: string | null; image: string | null } | null }
  links: BioLink[]
}

export function LinksView({ onelink, links }: LinksViewProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-linear-to-b from-neutral-100 to-white px-4 py-12 dark:from-neutral-900 dark:to-neutral-950">
      <div className="mx-auto max-w-md">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          {onelink.user?.image && (
            <Avatar className="mx-auto mb-4 h-20 w-20">
              <AvatarImage src={onelink.user.image} alt={onelink.user.name || ""} />
              <AvatarFallback className="text-2xl">
                {onelink.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <h1 className="text-2xl font-bold">
            {onelink.title || onelink.user?.name || "My Links"}
          </h1>
          {onelink.user?.name && onelink.title && (
            <p className="mt-1 text-muted-foreground">@{onelink.user.name}</p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-6 py-4 transition-all hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <span className="font-medium">{link.title}</span>
              <Icons.externalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 dark:bg-white">
              <Icons.link className="h-3 w-3 text-white dark:text-neutral-900" />
            </div>
            Made with OneLink
          </Link>
        </div>
      </div>
    </div>
  )
}