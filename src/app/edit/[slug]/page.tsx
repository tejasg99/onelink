import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { EditTextForm } from "@/components/forms/edit-text-form"
import { EditCodeForm } from "@/components/forms/edit-code-form"
import { EditFileForm } from "@/components/forms/edit-file-form"
import { EditLinksForm } from "@/components/forms/edit-links-form"

interface EditPageProps {
    params: Promise<{ slug: string }>
}

export default async function EditPage({ params }: EditPageProps) {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const { slug } = await params

    const onelink = await db.oneLink.findUnique({
        where: { slug },
        include: {
            textContent: true,
            codeContent: true,
            fileContent: true,
            bioLinks: {
                orderBy: { order: "asc" },
            },
        },
    })

    if (!onelink) {
        notFound()
    }

    // Check ownership
    if (onelink.userId !== session.user.id) {
        redirect("/dashboard")
    }

    // Check if expired
    const isExpired = onelink.expiresAt && new Date(onelink.expiresAt) < new Date()

    // Determine type icon
    const TypeIcon = {
        TEXT: Icons.text,
        CODE: Icons.code,
        FILE: Icons.file,
        LINKS: Icons.links,
    }[onelink.type]

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="shrink-0">
                        <Link href="/dashboard">
                            <Icons.chevronDown className="h-4 w-4 rotate-90" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Edit Link</h1>
                                <p className="text-sm text-muted-foreground">
                                    {onelink.type.charAt(0) + onelink.type.slice(1).toLowerCase()}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/s/${slug}`} target="_blank">
                            <Icons.externalLink className="mr-2 h-4 w-4" />
                            View
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Expired Warning */}
            {isExpired && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                    <Icons.warning className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="text-amber-600 dark:text-amber-400">
                        <p className="font-medium">This link has expired</p>
                        <p className="textsm opacity-90">
                            The content is no longer publicly accessible. Update the expiry
                            settings below to make it available again.
                        </p>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            <div className="rounded-xl border bg-card p-6">
                {onelink.type === "TEXT" && onelink.textContent && (
                    <EditTextForm onelink={onelink} content={onelink.textContent} />
                )}
                {onelink.type === "CODE" && onelink.codeContent && (
                    <EditCodeForm onelink={onelink} content={onelink.codeContent} />
                )}
                {onelink.type === "FILE" && onelink.fileContent && (
                    <EditFileForm onelink={onelink} content={onelink.fileContent} />
                )}
                {onelink.type === "LINKS" && (
                    <EditLinksForm onelink={onelink} links={onelink.bioLinks} />
                )}
            </div>
        </div>
    )
}