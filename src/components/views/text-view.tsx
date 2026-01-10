import { OneLink, TextContent } from "../../../generated/prisma/client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ViewHeader } from "@/components/views/view-header"
import { CopyButton } from "@/components/copy-button"

interface TextViewProps {
  onelink: OneLink & { user: { name: string | null; image: string | null } | null }
  content: TextContent
}

export function TextView({ onelink, content }: TextViewProps) {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <ViewHeader onelink={onelink} />

      <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <span className="text-sm text-muted-foreground">Markdown</span>
          <CopyButton text={content.content} />
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none p-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}