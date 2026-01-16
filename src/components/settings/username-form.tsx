"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import {
    usernameSchema,
    type UsernameFormData,
} from "@/lib/validations/onelink"
import {
    updateUsername,
    checkUsernameAvailability,
} from "@/lib/actions/settings"
import { useDebounce } from "@/hooks/use-debounce"

interface UsernameFormProps {
    currentUsername: string | null
}

export function UsernameForm({ currentUsername }: UsernameFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null)

    const form = useForm<UsernameFormData>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            username: currentUsername ?? "",
        },
    })

    const watchedUsername = form.watch("username")
    const debouncedUsername = useDebounce(watchedUsername, 500)

    // Check availability when username changes
    useEffect(() => {
        async function check() {
            if (!debouncedUsername || debouncedUsername.length < 3) {
                setIsAvailable(null)
                return
            }

            if (debouncedUsername === currentUsername) {
                setIsAvailable(true)
                return
            }

            setIsChecking(true)
            const result = await checkUsernameAvailability(debouncedUsername)
            setIsAvailable(result.available)
            setIsChecking(false)
        }

        check()
    }, [debouncedUsername, currentUsername])

    const onSubmit = async (data: UsernameFormData) => {
        setIsLoading(true)
        try {
            const result = await updateUsername(data)

            if (result.success) {
                toast.success("Username updated successfully")
            } else {
                toast.error(result.error || "Failed to update username")
            }
        } catch (error) {
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    const hasChanges = watchedUsername !== currentUsername

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                    <Input
                        id="username"
                        placeholder="your-username"
                        {...form.register("username")}
                        className="h-11 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isChecking && (
                            <Icons.spinner className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {!isChecking && isAvailable === true && watchedUsername && (
                            <Icons.check className="h-4 w-4 text-green-500" />
                        )}
                        {!isChecking && isAvailable === false && (
                            <Icons.close className="h-4 w-4 text-destructive" />
                        )}
                    </div>
                </div>
                {form.formState.errors.username && (
                    <p className="text-sm text-destructive">
                        {form.formState.errors.username.message}
                    </p>
                )}
                {!isChecking && isAvailable === false && (
                    <p className="text-sm text-destructive">
                        This username is already taken
                    </p>
                )}
            </div>

            <Button
                type="submit"
                disabled={isLoading || !hasChanges || isAvailable === false}
            >
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}