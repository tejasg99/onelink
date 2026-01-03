import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/user-button"
import { Icons } from "@/components/icons"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white">
            <Icons.link className="h-4 w-4 text-white dark:text-neutral-900" />
          </div>
          <span className="text-xl font-semibold tracking-tight text text-neutral-900 dark:text-neutral-100">OneLink</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button asChild size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                <Link href="/new">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Create
                </Link>
              </Button>
              <UserButton session={session} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                <Link href="/login">Get Started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}