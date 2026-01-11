import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default function NotFound() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Icons.link className="h-8 w-8 text-neutral-400" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">Link Not Found</h1>
                <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                The link you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>
                <div className="flex items-center justify-center gap-4">
                <Button asChild variant="outline">
                    <Link href="/">Go Home</Link>
                </Button>
                <Button asChild>
                    <Link href="/new">
                    <Icons.plus className="mr-2 h-4 w-4" />
                    Create Link
                    </Link>
                </Button>
                </div>
            </div>
        </div>
    )
}