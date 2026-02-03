"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { OneLink, FileContent } from "../../../generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { editFileSchema, type EditFileFormData } from "@/lib/validations/onelink"
import { editFileOneLink } from "@/lib/actions/onelink"
import { getBaseUrl, formatBytes } from "@/lib/utils"

interface EditFileFormProps {
    onelink: OneLink
    content: FileContent
}

export function EditFileForm({ onelink, content }: EditFileFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<EditFileFormData>({
        resolver: zodResolver(editFileSchema),
        defaultValues: {
            id: onelink.id,
            type: "FILE",
            title: onelink.title ?? "",
            visibility: onelink.visibility as "PUBLIC" | "UNLISTED",
            expiresIn: "keep",
        },
    })

    const onSubmit = async (data: EditFileFormData) => {
        setIsLoading(true)
        try {
            const result = await editFileOneLink(data)

            if (result.success) {
                toast.success("Link updated successfully!", {
                    action: {
                        label: "View",
                        onClick: () => window.open(`/s/${onelink.slug}`, "_blank"),
                    },
                })
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update link")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const currentExpiry = onelink.expiresAt
        ? new Date(onelink.expiresAt).toLocaleDateString()
        : "Never"

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Link Info */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <Icons.link className="h-4 w-4 shrink-0" />
                <code className="truncate">
                    {getBaseUrl()}/s/{onelink.slug}
                </code>
            </div>

            {/* File Info (Read-only) */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Icons.file className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{content.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatBytes(content.fileSize)} • {content.mimeType}
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                    <Icons.info className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>
                        The file itself cannot be changed. To upload a different file,
                        delete this link and create a new one.
                    </span>
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="My file..."
                    {...form.register("title")}
                    className="h-11"
                    disabled={isLoading}
                />
            </div>

            {/* Settings Row */}
            <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                    <Label>Visibility</Label>
                    <Select
                        value={form.watch("visibility")}
                        onValueChange={(value: "PUBLIC" | "UNLISTED") =>
                            form.setValue("visibility", value)
                        }
                        disabled={isLoading}
                    >
                        <SelectTrigger className="h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UNLISTED">
                                <div className="flex items-center gap-2">
                                    <Icons.lock className="h-4 w-4" />
                                    Unlisted
                                </div>
                            </SelectItem>
                            <SelectItem value="PUBLIC">
                                <div className="flex items-center gap-2">
                                    <Icons.globe className="h-4 w-4" />
                                    Public
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 space-y-2">
                    <Label>Expires</Label>
                    <Select
                        value={form.watch("expiresIn")}
                        onValueChange={(value: "never" | "1h" | "24h" | "7d" | "keep") =>
                            form.setValue("expiresIn", value)
                        }
                        disabled={isLoading}
                    >
                        <SelectTrigger className="h-11">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="keep">Keep current ({currentExpiry})</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="1h">1 hour from now</SelectItem>
                            <SelectItem value="24h">24 hours from now</SelectItem>
                            <SelectItem value="7d">7 days from now</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-foreground text-background hover:bg-foreground/90"
                >
                    {isLoading ? (
                        <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Icons.check className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        </form>
    )
}