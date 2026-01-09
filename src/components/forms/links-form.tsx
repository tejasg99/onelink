"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
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
import { linksSchema, type LinksFormData } from "@/lib/validations/onelink"
import { createLinksOneLink } from "@/lib/actions/onelink"
import { getBaseUrl } from "@/lib/utils"

export function LinksForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LinksFormData>({
    resolver: zodResolver(linksSchema),
    defaultValues: {
      type: "LINKS",
      title: "",
      visibility: "UNLISTED",
      expiresIn: "never",
      links: [{ title: "", url: "", icon: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  })

  const onSubmit = async (data: LinksFormData) => {
    setIsLoading(true)
    try {
      const result = await createLinksOneLink(data)

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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Page Title (optional)</Label>
        <Input
          id="title"
          placeholder="My Links"
          {...form.register("title")}
          className="h-11"
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
              className="flex gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex-1 space-y-3">
                <Input
                  placeholder="Link title"
                  {...form.register(`links.${index}.title`)}
                  className="h-10"
                />
                <Input
                  placeholder="https://example.com"
                  type="url"
                  {...form.register(`links.${index}.url`)}
                  className="h-10"
                />
                {form.formState.errors.links?.[index]?.url && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.links[index]?.url?.message}
                  </p>
                )}
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 self-start text-muted-foreground hover:text-red-500"
                  onClick={() => remove(index)}
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {form.formState.errors.links && (
          <p className="text-sm text-red-500">
            {form.formState.errors.links.message ||
              form.formState.errors.links.root?.message}
          </p>
        )}

        {fields.length < 20 && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ title: "", url: "", icon: "" })}
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
        className="h-11 w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Icons.links className="mr-2 h-4 w-4" />
            Create Link Page
          </>
        )}
      </Button>
    </form>
  )
}