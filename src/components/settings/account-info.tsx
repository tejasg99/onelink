import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"

interface AccountInfoProps {
    user: {
        name: string | null
        email: string
        image: string | null
        createdAt: Date
        _count: {
            onelinks: number
        }
    }
}

export function AccountInfo({ user }: AccountInfoProps) {
    return (
        <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                <AvatarFallback className="text-xl">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <h3 className="font-medium">{user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.mail className="h-4 w-4" />
                    {user.email}
                </div>
                <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Icons.link className="h-4 w-4" />
                        {user._count.onelinks} links
                    </span>
                    <span className="flex items-center gap-1">
                        <Icons.calendar className="h-4 w-4" />
                        Joined {user.createdAt.toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    )
}