import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { formatRelativeTime } from "@/lib/utils"

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
    take: 10,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Links</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Manage all your shared content
          </p>
        </div>
        <Button
          asChild
          className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <Link href="/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            Create Link
          </Link>
        </Button>
      </div>

      {onelinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 py-16 dark:border-neutral-700">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Icons.link className="h-8 w-8 text-neutral-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No links yet</h2>
          <p className="mb-6 text-neutral-600 dark:text-neutral-400">
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
        <div className="grid gap-4">
          {onelinks.map((link) => (
            <Link
              key={link.id}
              href={`/link/${link.slug}`}
              className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  {link.type === "TEXT" && <Icons.text className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />}
                  {link.type === "CODE" && <Icons.code className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />}
                  {link.type === "FILE" && <Icons.file className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />}
                  {link.type === "LINKS" && <Icons.links className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />}
                </div>
                <div>
                  <h3 className="font-medium">
                    {link.title || `Untitled ${link.type.toLowerCase()}`}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Icons.eye className="h-3.5 w-3.5" />
                      {link.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.clock className="h-3.5 w-3.5" />
                      {formatRelativeTime(link.createdAt)}
                    </span>
                    {link.expiresAt && (
                      <span className="text-amber-600 dark:text-amber-400">
                        Expires {formatRelativeTime(link.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {link.visibility.toLowerCase()}
                </span>
                <Icons.chevronDown className="h-4 w-4 -rotate-90 text-neutral-400 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}