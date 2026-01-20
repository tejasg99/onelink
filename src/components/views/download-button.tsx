"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { toast } from "sonner"

interface DownloadButtonProps {
    slug: string
    fileName: string
}

export function DownloadButton({ slug, fileName }: DownloadButtonProps) {
    const [isLoading, setIsLoading ] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            // Fetch the file through our API (which redirects to signed URL)
            const response = await fetch(`/api/file/${slug}`)

            if (!response.ok) {
                throw new Error("Download failed")
            }

            // Get the blob from the response
            const blob = await response.blob()

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success("Download Started")
        } catch (error) {
            console.error("Download failed:", error)
            toast.error("Download failed", {
                description: "Please try again",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button onClick={handleDownload} disabled={isLoading}>
            {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ):(
                <Icons.file className="mr-2 h-4 w-4"/>
            )}
            Download
        </Button>
    )
}