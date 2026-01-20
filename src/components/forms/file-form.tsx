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
import { Progress } from "@/components/ui/progress"
import { Icons } from "@/components/icons"
import { 
  formatBytes, 
  getBaseUrl, 
  cn, 
  copyToClipboard 
} from "@/lib/utils"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export function FileForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Maximum file size is 20MB",
      })
      return
    }
    setFile(selectedFile)
    if (!title) {
      setTitle(selectedFile.name)
    }
  }

  const removeFile = () => {
    setFile(null)
    setUploadProgress(0)
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
    setUploadProgress(0)
    try {
      // Get signed URL
      const urlResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      })

      if(!urlResponse.ok) {
        const error = await urlResponse.json()
        throw new Error(error.error || "Failed to get upload URL")
      }

      const { signedUrl, path } = await urlResponse.json()

      // Upload file directly to Supabase using XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (event) => {
          if(event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(progress)
          }
        })

        xhr.addEventListener("load", () => {
          if(xhr.status >= 200 && xhr.status < 300 ) {
            resolve()
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"))
        })

        xhr.open("PUT", signedUrl)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.send(file)
      })

      // Create db record
      const completeResponse = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          title,
          visibility,
          expiresIn
        }),
      })

      if(!completeResponse.ok) {
        const error = await completeResponse.json()
        throw new Error(error.error || "Failed to save file")
      }

      const { slug } = await completeResponse.json()
      
      toast.success("File Uploaded", {
        description: `${getBaseUrl()}/s/${slug}`,
        action: {
          label: "Copy",
          onClick: () => copyToClipboard(`${getBaseUrl()}/s/${slug}`), // needs confirmation
        },
      })

      router.push(`/s/${slug}`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Upload failed")
      setUploadProgress(0)
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
          disabled={isLoading}
        />
      </div>

      {/* File Drop Zone */}
      <div className="space-y-2">
        <Label>File</Label>
        <div
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
            dragActive
              ? "border-foreground/50 bg-muted"
              : "border",
            file && "border-solid border bg-muted/50",
            isLoading && "pointer-events-none opacity-60"
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Icons.file className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
              </div>
              {!isLoading && (
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
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Icons.file className="h-7 w-7 text-muted-foreground" />
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
        {/* Upload Progress */}
        {isLoading && uploadProgress > 0 && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      {/* Settings Row */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 space-y-2">
          <Label>Visibility</Label>
          <Select 
            value={visibility} 
            onValueChange={(v: "PUBLIC" | "UNLISTED") => setVisibility(v)}
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
            value={expiresIn} 
            onValueChange={(v: "never" | "1h" | "24h" | "7d") => setExpiresIn(v)}
            disabled={isLoading}
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
        disabled={isLoading || !file}
        className="h-11 w-full bg-foreground text-background hover:bg-foreground/90 cursor-pointer border"
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            {uploadProgress > 0 ? `Uploading ${uploadProgress}%...` : "Preparing..."}
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