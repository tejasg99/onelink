"use client"

import { useState } from "react"
import { OneLink } from "../../../generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { formatRelativeTime, getBaseUrl, copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"

interface ViewHeaderProps {
    onelink: OneLink & { user: { name: string | null; image: string | null } | null }
}

export function ViewHeader({ onelink }: ViewHeaderProps) {
    const [copied, setCopied ] = useState(false)

    const handleCopyLink = async () => {
        const url = `${getBaseUrl()}/s/${onelink.slug}`
        await copyToClipboard(url)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        {onelink.title || `Untitled ${onelink.type.toLowerCase()}`}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {onelink.user?.name && (
                            <span className="flex items-center gap-1">
                                <Icons.user className="h-3.5 w-3.5" />
                                {onelink.user.name}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Icons.clock className="h-3.5 w-3.5" />
                            {formatRelativeTime(onelink.createdAt)}
                        </span>
                        {onelink.expiresAt && (
                            <Badge variant="secondary" className="text-amber-600 dark:text-amber-400">
                                <Icons.clock className="mr-1 h-3 w-3" />
                                Expires {formatRelativeTime(onelink.expiresAt)}
                            </Badge>
                        )}
                    </div>
                </div>
                <Button variant={"outline"} size="sm" onClick={handleCopyLink}>
                    { copied ? (
                        <Icons.check className="mr-2 h-4 w-4 text-green-500"/>
                    ): (
                        <Icons.copy className="mr-2 h-4 w-4" />
                    )}
                    { copied ? "Copied": "Copy"}
                </Button>
            </div>
        </div>
    )
}