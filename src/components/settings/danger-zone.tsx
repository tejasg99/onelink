"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Icons } from "@/components/icons"
import { deleteAccount } from "@/lib/actions/settings"

interface DangerZoneProps {
    linkCount: number
}

export function DangerZone({ linkCount }: DangerZoneProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [confirmText, setConfirmText] = useState("")

    const handleDelete = async () => {
        setIsLoading(true)
        try {
            const result = await deleteAccount()

            if (result.success) {
                toast.success("Account deleted successfully")
                await signOut({ redirectTo: "/" })
            } else {
                toast.error(result.error || "Failed to delete account")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. This will
                permanently delete your account and all {linkCount} links.
            </p>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="destructive"
                        className="cursor-pointer"
                    >
                        <Icons.trash className="mr-2 h-4 w-4" />
                        Delete Account
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <span className="block">
                                This action cannot be undone. This will permanently delete your
                                account and remove all your data from our servers.
                            </span>
                            <span className="block">
                                You will lose access to <strong>{linkCount} links</strong> and
                                all associated files.
                            </span>
                            <span className="block pt-2">
                                Type <strong>delete my account</strong> to confirm:
                            </span>
                            <Input
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="delete my account"
                                className="mt-2"
                            />
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setConfirmText("")}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={confirmText !== "delete my account" || isLoading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isLoading && (
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}