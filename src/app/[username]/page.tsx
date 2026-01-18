import { notFound } from "next/navigation"
import { Metadata } from "next"
import { db } from "@/lib/db"
import { ProfileView } from "@/components/views/profile-view"

interface ProfilePageProps {
    params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { username } = await params

    // Skip reserved routes
    const reservedRoutes = ["api", "login", "dashboard", "new", "settings", "s"]
    if (reservedRoutes.includes(username.toLowerCase())) {
        notFound()
    }

    const user = await db.user.findUnique({
        where: { username: username.toLowerCase() },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            onelinks: {
                where: {
                    type: "LINKS",
                    visibility: "PUBLIC",
                    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                },
                include: {
                    bioLinks: {
                        orderBy: { order: "asc" }
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 1, // Get the most recent public links page
            },
        },
    })

    if (!user) {
        notFound()
    }

    const linksPage = user.onelinks[0]

    return (
        <ProfileView
            user={user}
            links={linksPage?.bioLinks ?? []}
            title={linksPage?.title}
        />
    )
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
    const { username } = await params

    const user = await db.user.findUnique({
        where: { username: username.toLowerCase() },
        select: { name: true, username: true },
    })

    if (!user) {
        return { title: "User Not Found" }
    }

    return {
        title: `${user.name || user.username} | OneLink`,
        description: `Check out ${user.name || user.username}'s links on OneLink`,
    }
}