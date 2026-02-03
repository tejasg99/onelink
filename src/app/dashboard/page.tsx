import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Icons } from "@/components/icons"
import { formatRelativeTime, getBaseUrl } from "@/lib/utils"
import { DeleteLinkButton } from "@/components/delete-link-button"
import { CopyLinkButton } from "@/components/copy-link-button"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const onelinks = await db.oneLink.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const baseUrl = getBaseUrl()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Links</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all your shared content
          </p>
        </div>
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <Link href="/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Link
          </Link>
        </Button>
      </div>

      {onelinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Icons.link className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No links yet</h2>
          <p className="mb-6 text-muted-foreground">
            Create your first link to get started
          </p>
          <Button asChild>
            <Link href="/new">
              <Icons.plus className="mr-2 h-4 w-4" />
              Create your first link
            </Link>
          </Button>
        </div>
      ) : (
        <TooltipProvider>
          <div className="grid gap-4">
            {onelinks.map((link) => {
              const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date()
              const linkUrl = `${baseUrl}/s/${link.slug}`

              return (
                <div
                  key={link.id}
                  className={`group rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-md ${isExpired ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left side link info */}
                    <div className="flex flex-1 items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {link.type === "TEXT" && (
                          <Icons.text className="h-5 w-5 text-muted-foreground" />
                        )}
                        {link.type === "CODE" && (
                          <Icons.code className="h-5 w-5 text-muted-foreground" />
                        )}
                        {link.type === "FILE" && (
                          <Icons.file className="h-5 w-5 text-muted-foreground" />
                        )}
                        {link.type === "LINKS" && (
                          <Icons.links className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-medium">
                            {link.title || `Untitled ${link.type.toLowerCase()}`}
                          </h3>
                          {isExpired && (
                            <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                              Expired
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icons.eye className="h-3.5 w-3.5" />
                            {link.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icons.clock className="h-3.5 w-3.5" />
                            {formatRelativeTime(link.createdAt)}
                          </span>
                          {link.expiresAt && !isExpired && (
                            <span className="text-amber-600 dark:text-amber-400">
                              Expires {formatRelativeTime(link.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Right side Actions */}
                    <div className="flex items-center gap-1">
                      {/* Visibility Badge */}
                      <span
                        className="mr-2 hidden rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground sm:inline-block"
                      >
                        {link.visibility === "PUBLIC" ? (
                          <span className="flex items-center gap-1">
                            <Icons.globe className="h-3 w-3" />
                            Public
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Icons.lock className="h-3 w-3" />
                            Unlisted
                          </span>
                        )}
                      </span>

                      {/* Copy Link */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <CopyLinkButton url={linkUrl} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Copy Link</TooltipContent>
                      </Tooltip>

                      {/* View Link */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/s/${link.slug}`}>
                              <Icons.externalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View link</TooltipContent>
                      </Tooltip>

                      {/* Edit Link */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/edit/${link.slug}`}>
                              <Icons.edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit link</TooltipContent>
                      </Tooltip>

                      {/* Delete Link */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DeleteLinkButton id={link.id} title={link.title} />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>Delete link</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </TooltipProvider>
      )}
    </div>
  )
}