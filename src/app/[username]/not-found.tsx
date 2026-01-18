import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default function ProfileNotFound() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Icons.user className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">Profile Not Found</h1>
                <p className="mb-6 text-muted-foreground">
                    This username doesn&apos;t exist or hasn&apos;t been claimed yet.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/">Go Home</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/login">
                            Claim this username
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}