"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
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
import { createFileOneLink } from "@/lib/actions/onelink"
import { formatBytes, getBaseUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export function FileForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [title, setTitle] = useState("")
  const [visibility, setVisibility] = useState<"PUBLIC" | "UNLISTED">("UNLISTED")
  const [expiresIn, setExpiresIn] = useState<"never" | "1h" | "24h" | "7d">("never")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Maximum file size is 20MB",
      })
      return
    }
    setFile(file)
    if (!title) {
      setTitle(file.name)
    }
  }

  const removeFile = () => {
    setFile(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error("Please select a file")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("visibility", visibility)
      formData.append("expiresIn", expiresIn)

      const result = await createFileOneLink(formData)

      if (result.success && result.slug) {
        toast.success("File uploaded!", {
          description: `${getBaseUrl()}/s/${result.slug}`,
          action: {
            label: "Copy",
            onClick: () => navigator.clipboard.writeText(`${getBaseUrl()}/s/${result.slug}`),
          },
        })
        router.push(`/s/${result.slug}`)
      } else {
        toast.error(result.error || "Failed to upload file")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          placeholder="My file..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-11"
        />
      </div>

      {/* File Drop Zone */}
      <div className="space-y-2">
        <Label>File</Label>
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
            dragActive
              ? "border-neutral-400 bg-neutral-50 dark:border-neutral-500 dark:bg-neutral-900"
              : "border-neutral-300 dark:border-neutral-700",
            file && "border-solid border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleChange}
            disabled={isLoading}
          />

          {file ? (
            <div className="flex w-full items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800">
                <Icons.file className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  removeFile()
                }}
                className="shrink-0"
              >
                <Icons.close className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <Icons.file className="h-7 w-7 text-neutral-500" />
              </div>
              <p className="mb-1 text-sm font-medium">
                Drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum file size: 20MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Settings Row */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-2">
          <Label>Visibility</Label>
          <Select value={visibility} onValueChange={(v: "PUBLIC" | "UNLISTED") => setVisibility(v)}>
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
          <Select value={expiresIn} onValueChange={(v: "never" | "1h" | "24h" | "7d") => setExpiresIn(v)}>
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
        disabled={isLoading || !file}
        className="h-11 w-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer border"
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Icons.file className="mr-2 h-4 w-4" />
            Upload File
          </>
        )}
      </Button>
    </form>
  )
}