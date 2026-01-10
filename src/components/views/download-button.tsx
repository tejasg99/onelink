"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface DownloadButtonProps {
    slug: string
    fileName: string
}

export function DownloadButton({ slug, fileName }: DownloadButtonProps) {
    const [isLoading, setIsLoading ] = useState(false)

    const handleDownload = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/file/${slug}`);
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Download Failed: ", error)
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