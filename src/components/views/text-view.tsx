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

      <div className="rounded-xl border bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm ">Markdown</span>
          <CopyButton text={content.content} />
        </div>

        {/* Content */}
        <div className="prose max-w-none p-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}