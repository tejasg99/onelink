import { OneLink, FileContent } from "../../../generated/prisma/client"
import { ViewHeader } from "@/components/views/view-header"
import { DownloadButton } from "@/components/views/download-button"
import { Icons } from "@/components/icons"
import { formatBytes } from "@/lib/utils"
import Image from "next/image"

interface FileViewProps {
    onelink: OneLink & { user: { name: string | null; image: string | null } | null }
    content: FileContent
}

export function FileView({ onelink, content }: FileViewProps) {
    const isImage = content.mimeType.startsWith("image/")
    const isVideo = content.mimeType.startsWith("video/")
    const isAudio = content.mimeType.startsWith("audio/")
    const isPdf = content.mimeType === "application/pdf"

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <ViewHeader onelink={onelink} />
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                {/* File Info Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                        <Icons.file className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <div>
                        <h2 className="font-medium">{content.fileName}</h2>
                        <p className="text-sm text-muted-foreground">
                            {formatBytes(content.fileSize)} • {content.mimeType}
                        </p>
                        </div>
                    </div>
                    <DownloadButton slug={onelink.slug} fileName={content.fileName} />
                </div>

                {/* Preview Area */}
                <div className="flex min-h-75 items-center justify-center bg-neutral-50 p-8 dark:bg-neutral-950">
                    {isImage && (
                        <Image
                        src={`/api/file/${onelink.slug}`}
                        alt={content.fileName}
                        className="max-h-125 max-w-full rounded-lg object-contain"
                        />
                    )}

                    {isVideo && (
                        <video
                        src={`/api/file/${onelink.slug}`}
                        controls
                        className="max-h-125 max-w-full rounded-lg"
                        >
                        Your browser does not support the video tag.
                        </video>
                    )}

                    {isAudio && (
                        <div className="w-full max-w-md">
                        <audio src={`/api/file/${onelink.slug}`} controls className="w-full">
                            Your browser does not support the audio tag.
                        </audio>
                        </div>
                    )}

                    {isPdf && (
                        <iframe
                        src={`/api/file/${onelink.slug}`}
                        className="h-150 w-full rounded-lg border-0"
                        title={content.fileName}
                        />
                    )}

                    {!isImage && !isVideo && !isAudio && !isPdf && (
                        <div className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                            <Icons.file className="h-10 w-10 text-neutral-500" />
                        </div>
                        <p className="mb-2 font-medium">{content.fileName}</p>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Preview not available for this file type
                        </p>
                        <DownloadButton slug={onelink.slug} fileName={content.fileName} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}