import { OneLink, FileContent } from "../../../generated/prisma/client"
import { ViewHeader } from "@/components/views/view-header"
import { DownloadButton } from "@/components/views/download-button"
import { FilePreview } from "@/components/views/file-preview"
import { Icons } from "@/components/icons"
import { formatBytes } from "@/lib/utils"

interface FileViewProps {
    onelink: OneLink & { 
        user: { name: string | null; image: string | null; username: string | null } | null
    }
    content: FileContent
}

export function FileView({ onelink, content }: FileViewProps) {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <ViewHeader onelink={onelink} />

            <div className="overflow-hidden rounded-xl border border-border bg-card">
                {/* File Info Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Icons.file className="h-6 w-6 text-muted-foreground" />
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
                <FilePreview 
                    slug={onelink.slug}
                    fileName={content.fileName}
                    mimeType={content.mimeType}
                />
            </div>
        </div>
    )
}