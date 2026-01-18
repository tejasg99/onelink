"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"

interface CopyButtonProps {
  text: string
  className?: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
  label?: string
}

export function CopyButton({
  text,
  className,
  variant = "ghost",
  size = "icon",
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    toast.success("Content copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
    >
      {copied ? (
        <Icons.check className="h-4 w-4 text-green-500" />
      ) : (
        <Icons.copy className="h-4 w-4" />
      )}
      {label && <span className="ml-2">{label}</span>}
    </Button>
  )
}