import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function ExpiredView() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <Icons.clock className="h-8 w-8 text-neutral-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Link Expired</h1>
        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
          This link has expired and is no longer available.
        </p>
        <Button asChild>
          <Link href="/">
            <Icons.link className="mr-2 h-4 w-4" />
            Create your own link
          </Link>
        </Button>
      </div>
    </div>
  )
}