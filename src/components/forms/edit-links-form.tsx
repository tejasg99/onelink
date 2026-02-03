"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { OneLink, BioLink } from "../../../generated/prisma/client"
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
import { editLinksSchema, type EditLinksFormData } from "@/lib/validations/onelink"
import { editLinksOneLink } from "@/lib/actions/onelink"
import { getBaseUrl } from "@/lib/utils"

interface EditLinksFormProps {
    onelink: OneLink
    links: BioLink[]
}

export function EditLinksForm({ onelink, links }: EditLinksFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<EditLinksFormData>({
        resolver: zodResolver(editLinksSchema),
        defaultValues: {
            id: onelink.id,
            type: "LINKS",
            title: onelink.title ?? "",
            visibility: onelink.visibility as "PUBLIC" | "UNLISTED",
            expiresIn: "keep",
            links: links.length > 0
                ? links.map((link) => ({
                    id: link.id,
                    title: link.title,
                    url: link.url,
                    icon: link.icon ?? "",
                }))
                : [{ title: "", url: "", icon: "" }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "links",
    })

    const onSubmit = async (data: EditLinksFormData) => {
        setIsLoading(true)
        try {
            const result = await editLinksOneLink(data)

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

            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Page Title (optional)</Label>
                <Input
                    id="title"
                    placeholder="My Links"
                    {...form.register("title")}
                    className="h-11"
                    disabled={isLoading}
                />
            </div>

            {/* Links */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Links</Label>
                    <span className="text-xs text-muted-foreground">
                        {fields.length} / 20
                    </span>
                </div>

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="flex gap-3 rounded-lg border border-border bg-muted/30 p-4"
                        >
                            <div className="flex-1 space-y-3">
                                <Input
                                    placeholder="Link title"
                                    {...form.register(`links.${index}.title`)}
                                    className="h-10"
                                    disabled={isLoading}
                                />
                                <Input
                                    placeholder="https://example.com"
                                    type="url"
                                    {...form.register(`links.${index}.url`)}
                                    className="h-10"
                                    disabled={isLoading}
                                />
                                {form.formState.errors.links?.[index]?.title && (
                                    <p className="text-xs text-destructive">
                                        {form.formState.errors.links[index]?.title?.message}
                                    </p>
                                )}
                                {form.formState.errors.links?.[index]?.url && (
                                    <p className="text-xs text-destructive">
                                        {form.formState.errors.links[index]?.url?.message}
                                    </p>
                                )}
                            </div>
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 self-start text-muted-foreground hover:text-destructive"
                                    onClick={() => remove(index)}
                                    disabled={isLoading}
                                >
                                    <Icons.trash className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {form.formState.errors.links && !Array.isArray(form.formState.errors.links) && (
                    <p className="text-sm text-destructive">
                        {form.formState.errors.links.message}
                    </p>
                )}

                {fields.length < 20 && (
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => append({ title: "", url: "", icon: "" })}
                        disabled={isLoading}
                    >
                        <Icons.plus className="mr-2 h-4 w-4" />
                        Add Link
                    </Button>
                )}
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