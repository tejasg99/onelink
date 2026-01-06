import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 0) {
    // Future date (for expiry)
    const absDiff = Math.abs(diffInSeconds)
    if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)}m`
    if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)}h`
    if (absDiff < 604800) return `in ${Math.floor(absDiff / 86400)}d`
    return `on ${date.toLocaleDateString()}`
  }

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

export function getExpiryDate(expiresIn: string): Date | null {
  const now = new Date()

  switch (expiresIn) {
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000)
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    case "never":
    default:
      return null
  }
}

export function getBaseUrl(): string {
  if(typeof window !== "undefined") return window.location.origin
  if(process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}