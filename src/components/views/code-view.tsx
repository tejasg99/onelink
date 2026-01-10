import { OneLink, CodeContent } from "../../../generated/prisma/client"
import { highlightCode, SUPPORTED_LANGUAGES } from "@/lib/highlighter"
import { ViewHeader } from "@/components/views/view-header"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"

interface CodeViewProps {
  onelink: OneLink & { user: { name: string | null; image: string | null } | null }
  content: CodeContent
}

export async function CodeView({ onelink, content }: CodeViewProps) {
  // Get highlighted code from highlighter.ts
  const highlightedCode = await highlightCode(content.content, content.language)

  const languageLabel =
    SUPPORTED_LANGUAGES.find((l) => l.value === content.language)?.label ||
    content.language

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <ViewHeader onelink={onelink} />

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-950 dark:border-neutral-800">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3">
          <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
            {languageLabel}
          </Badge>
          <CopyButton
            text={content.content}
            className="text-neutral-400 hover:text-white"
          />
        </div>

        {/* Code */}
        <div
          className="overflow-x-auto p-4 text-sm [&>pre]:m-0! [&>pre]:bg-transparent! [&>pre]:p-0!"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  )
}