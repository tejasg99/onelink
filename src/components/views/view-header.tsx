"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { OneLink } from "../../../generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { formatRelativeTime, getBaseUrl, copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"
import { QRCodeCanvas } from "qrcode.react"

interface ViewHeaderProps {
    onelink: OneLink & { user: { name: string | null; image: string | null } | null }
}

export function ViewHeader({ onelink }: ViewHeaderProps) {
    const [copied, setCopied] = useState(false)
    const [qrOpen, setQrOpen] = useState(false)
    const qrRef = useRef<HTMLDivElement>(null)

    const shareUrl = `${getBaseUrl()}/s/${onelink.slug}`

    const handleCopyLink = async () => {
        await copyToClipboard(shareUrl)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    // Close popover on outside click
    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (qrRef.current && !qrRef.current.contains(e.target as Node)) {
            setQrOpen(false)
        }
    }, [])

    useEffect(() => {
        if (qrOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [qrOpen, handleClickOutside])

    const handleDownloadQr = () => {
        const canvas = qrRef.current?.querySelector("canvas")
        if (!canvas) return
        const url = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = url
        a.download = `onelink-${onelink.slug}-qr.png`
        a.click()
        toast.success("QR code downloaded!")
    }

    return (
        <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        {onelink.title || `Untitled ${onelink.type.toLowerCase()}`}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {onelink.user?.name && (
                            <span className="flex items-center gap-1">
                                <Icons.user className="h-3.5 w-3.5" />
                                {onelink.user.name}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Icons.clock className="h-3.5 w-3.5" />
                            {formatRelativeTime(onelink.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Icons.eye className="h-3.5 w-3.5" />
                            {onelink.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <Icons.lock className="h-3.5 w-3.5" />
                            {onelink.visibility.toLowerCase()}
                        </span>
                        {onelink.expiresAt && (
                            <Badge variant="secondary" className="text-amber-600 dark:text-amber-400">
                                <Icons.clock className="mr-1 h-3 w-3" />
                                Expires {formatRelativeTime(onelink.expiresAt)}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* QR Code button */}
                    <div className="relative" ref={qrRef}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9"
                                    onClick={() => setQrOpen((prev) => !prev)}
                                    aria-label="Show QR code"
                                >
                                    <Icons.qrCode className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            {!qrOpen && (
                                <TooltipContent side="bottom">QR Code</TooltipContent>
                            )}
                        </Tooltip>

                        {/* QR Popover — fixed centered overlay for all screen sizes */}
                        {qrOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in-0"
                                    onClick={() => setQrOpen(false)}
                                />
                                <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-popover p-5 shadow-2xl animate-in fade-in-0 zoom-in-95">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex w-full items-center justify-between">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Scan to open this link
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => setQrOpen(false)}
                                                aria-label="Close QR code"
                                            >
                                                <Icons.close className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="rounded-lg bg-white p-3">
                                            <QRCodeCanvas
                                                value={shareUrl}
                                                size={180}
                                                level="M"
                                                marginSize={1}
                                            />
                                        </div>
                                        <p className="max-w-[220px] truncate text-center text-[11px] text-muted-foreground">
                                            {shareUrl}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={handleDownloadQr}
                                        >
                                            <Icons.download className="mr-2 h-3.5 w-3.5" />
                                            Download PNG
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Copy Link button */}
                    <Button variant={"outline"} size="sm" onClick={handleCopyLink}>
                        {copied ? (
                            <Icons.check className="mr-2 h-4 w-4 text-green-500" />
                        ) : (
                            <Icons.copy className="mr-2 h-4 w-4" />
                        )}
                        {copied ? "Copied" : "Copy Link"}
                    </Button>
                </div>
            </div>
        </div>
    )
}