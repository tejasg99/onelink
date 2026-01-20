"use client"

import { useState, useEffect } from "react"
import { Icons } from "@/components/icons"
import { DownloadButton } from "@/components/views/download-button"
import Image from "next/image"

interface FilePreviewProps {
    slug: string
    fileName: string
    mimeType: string
}

export function FilePreview({ slug, fileName, mimeType }: FilePreviewProps) {
    const [error, setError] = useState(false)

    const isImage = mimeType.startsWith("image/")
    const isVideo = mimeType.startsWith("video/")
    const isAudio = mimeType.startsWith("audio/")
    const isPdf = mimeType === "application/pdf"

    const canPreview = isImage || isVideo || isAudio || isPdf
    const previewUrl = canPreview ? `/api/file/${slug}` : null

    if (!canPreview || error) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center bg-muted/30 p-8">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Icons.file className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="mb-2 font-medium">{fileName}</p>
                <p className="mb-6 text-sm text-muted-foreground">
                    Preview not available for this file type
                </p>
                <DownloadButton slug={slug} fileName={fileName} />
            </div>
        )
    }

    return (
        <div className="flex min-h-[300px] items-center justify-center bg-muted/30 p-8">
            {isImage && previewUrl && (
                <Image
                    src={previewUrl}
                    alt={fileName}
                    className="max-h-[500px] max-w-full rounded-lg object-contain"
                    onError={() => setError(true)}
                />
            )}

            {isVideo && previewUrl && (
                <video
                    src={previewUrl}
                    controls
                    className="max-h-[500px] max-w-full rounded-lg"
                    onError={() => setError(true)}
                >
                    Your browser does not support the video tag.
                </video>
            )}

            {isAudio && previewUrl && (
                <div className="w-full max-w-md">
                    <audio
                        src={previewUrl}
                        controls
                        className="w-full"
                        onError={() => setError(true)}
                    >
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            )}

            {isPdf && previewUrl && (
                <iframe
                    src={previewUrl}
                    className="h-[600px] w-full rounded-lg border-0"
                    title={fileName}
                    onError={() => setError(true)}
                />
            )}
        </div>
    )
}