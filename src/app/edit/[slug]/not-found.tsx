import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default function EditNotFound() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Icons.edit className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="mb-2 text-2xl font-bold">Link Not Found</h1>
                <p className="mb-6 text-muted-foreground">
                    The link you&apos;re trying to edit doesn&apos;t exist or has been deleted.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <Icons.chevronDown className="mr-2 h-4 w-4 rotate-90" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/new">
                            <Icons.plus className="mr-2 h-4 w-4" />
                            Create New Link
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}