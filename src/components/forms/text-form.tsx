"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
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
import { textSchema, type TextFormData } from "@/lib/validations/onelink"
import { createTextOneLink } from "@/lib/actions/onelink"
import { getBaseUrl } from "@/lib/utils"

export function TextForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TextFormData>({
    resolver: zodResolver(textSchema),
    defaultValues: {
      type: "TEXT",
      title: "",
      content: "",
      visibility: "UNLISTED",
      expiresIn: "never",
    },
  })

  const onSubmit = async (data: TextFormData) => {
    setIsLoading(true)
    try {
      const result = await createTextOneLink(data)

      if (result.success && result.slug) {
        toast.success("Link created!", {
          description: `${getBaseUrl()}/s/${result.slug}`,
          action: {
            label: "Copy",
            onClick: () => navigator.clipboard.writeText(`${getBaseUrl()}/s/${result.slug}`),
          },
        })
        router.push(`/s/${result.slug}`)
      } else {
        toast.error(result.error || "Failed to create link")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const charCount = form.watch("content")?.length || 0

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          placeholder="My note..."
          {...form.register("title")}
          className="h-11"
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
          className="min-h-[300px] resize-y font-mono text-sm"
          {...form.register("content")}
        />
        {form.formState.errors.content && (
          <p className="text-sm text-red-500">
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
            onValueChange={(value: "never" | "1h" | "24h" | "7d") =>
              form.setValue("expiresIn", value)
            }
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="h-11 w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer border"
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Icons.link className="mr-2 h-4 w-4" />
            Create Link
          </>
        )}
      </Button>
    </form>
  )
}