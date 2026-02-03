"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { OneLink, TextContent } from "../../../generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { editTextSchema, type EditTextFormData } from "@/lib/validations/onelink"
import { editTextOneLink } from "@/lib/actions/onelink"
import { getBaseUrl } from "@/lib/utils"

interface EditTextFormProps {
    onelink: OneLink
    content: TextContent
}

export function EditTextForm({ onelink, content }: EditTextFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        resolver: zodResolver(editTextSchema),
        defaultValues: {
            id: onelink.id,
            type: "TEXT",
            title: onelink.title ?? "",
            content: content.content,
            visibility: onelink.visibility as "PUBLIC" | "UNLISTED",
            expiresIn: "keep",
        },
    })

    const onSubmit = async (data: EditTextFormData) => {
        setIsLoading(true)
        try {
            const result = await editTextOneLink(data)

            if (result.success) {
                toast.success("Link updated successfully", {
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

    const charCount = form.watch("content")?.length || 0
    const currentExpiry = onelink.expiresAt ? new Date(onelink.expiresAt).toLocaleDateString() : "Never"

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Link Info */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <Icons.link className="h-4 w-4 shrink-0" />
                <code className="truncate">
                    {getBaseUrl()}/s/{onelink.slug}
                </code>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                    id="title"
                    placeholder="My note..."
                    {...form.register("title")}
                    className="h-11"
                    disabled={isLoading}
                />
            </div>

            {/* Content */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="content">Content</Label>
                    <span className="text-xs text-muted-foreground">
                        {charCount.toLocaleString()} / 50,000
                    </span>
                </div>
                <Textarea
                    id="content"
                    placeholder="Write your text here... Markdown is supported."
                    className="min-h-75 resize-y font-mono text-sm"
                    {...form.register("content")}
                    disabled={isLoading}
                />
                {form.formState.errors.content && (
                    <p className="text-sm text-destructive">
                        {form.formState.errors.content.message}
                    </p>
                )}
            </div>

            {/* Settings Row */}
            <div className="flex flex-col gap-4 sm:flex-row">
                {/* Visibility */}
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

                {/* Expiry */}
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