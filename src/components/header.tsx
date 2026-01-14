import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/user-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Icons } from "@/components/icons"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <Icons.link className="h-4 w-4 text-background" />
          </div>
          <span className="text-xl font-semibold tracking-tight">OneLink</span>
        </Link>

        <nav className="flex items-center space-x-4">
          <ThemeToggle />
          {session ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                size="sm" 
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <Link href="/new">
                  <Icons.plus className="mr-1 h-4 w-4" />
                  Create
                </Link>
              </Button>
              <UserButton session={session} />
            </>
          ) : (
            <>
              <Button 
                asChild 
                variant="outline" 
                size="sm"
                className="hover:bg-neutral-700 hover:text-neutral-100"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}