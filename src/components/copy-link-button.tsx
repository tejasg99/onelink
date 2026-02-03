"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"

interface CopyLinkButtonProps {
  url: string
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(url)
    setCopied(true)
    toast.success("Link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="cursor-pointer">
      {copied ? (
        <Icons.check className="h-4 w-4 text-green-500" />
      ) : (
        <Icons.copy className="h-4 w-4" />
      )}
    </Button>
  )
}