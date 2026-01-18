import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { UsernameForm } from "@/components/settings/username-form"
import { AccountInfo } from "@/components/settings/account-info"
import { DangerZone } from "@/components/settings/danger-zone"
import { getBaseUrl } from "@/lib/utils"

export default async function SettingsPage() {
    const session = await auth()

    if (!session) {
        redirect("/login")
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
            createdAt: true,
            _count: {
                select: { onelinks: true },
            },
        },
    })

    if (!user) {
        redirect("/login")
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="mt-1 text-muted-foreground">
                    Manage your account settings and profile
                </p>
            </div>

            <div className="space-y-8">
                {/* Account Info */}
                <section className="rounded-xl border border-border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Account</h2>
                    <AccountInfo user={user} />
                </section>

                {/* Username */}
                <section className="rounded-xl border border-border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Profile URL</h2>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Set a custom username for your public profile page. Your link-in-bio
                        pages will be accessible at{" "}
                    </p>
                    <UsernameForm currentUsername={user.username} />
                </section>

                {/* Danger Zone */}
                <section className="rounded-xl border border-destructive/50 bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold text-destructive">
                        Danger Zone
                    </h2>
                    <DangerZone linkCount={user._count.onelinks} />
                </section>
            </div>
        </div>
    )
}