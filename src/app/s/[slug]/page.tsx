import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { incrementViewCount } from "@/lib/actions/onelink"
import { TextView } from "@/components/views/text-view"
import { CodeView } from "@/components/views/code-view"
import { FileView } from "@/components/views/file-view"
import { LinksView } from "@/components/views/links-view"
import { ExpiredView } from "@/components/views/expired-view"

interface ViewPageProps {
  params: Promise<{ slug: string }>
}

export default async function ViewPage({ params }: ViewPageProps) {
    const { slug } = await params;

    const onelink = await db.oneLink.findUnique({
        where: { slug },
        include: {
            textContent: true,
            codeContent: true,
            fileContent: true,
            bioLinks: {
                orderBy: { order: "asc"},
            },
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    })

    if(!onelink) {
        notFound();
    }

    // check if expired
    if(onelink.expiresAt && new Date(onelink.expiresAt) < new Date()) {
        return <ExpiredView />
    }

    // Increment view count
    incrementViewCount(slug)

    // Render based on type
    switch (onelink.type) {
        case "TEXT": {
            if (!onelink.textContent) return null
            return (
                <TextView 
                    onelink={onelink}
                    content={onelink.textContent}
                />
            )
        }
        case "CODE":
            return (
                <CodeView
                onelink={onelink}
                content={onelink.codeContent!}
                />
            )
        case "FILE":
            return (
                <FileView
                onelink={onelink}
                content={onelink.fileContent!}
                />
            )
        case "LINKS":
            return (
                <LinksView
                onelink={onelink}
                links={onelink.bioLinks}
                />
            )    
    
        default:
            notFound()
    }
}

export async function generateMetadata({params}: ViewPageProps) {
    const { slug } = await params

    const onelink = await db.oneLink.findUnique({
        where: { slug },
        select: { title: true, type: true }
    })

    if(!onelink) {
        return { title: "Not Found"}
    }

    return {
        title: onelink.title || `Shared ${onelink.type.toLowerCase()} | OneLink`,
        description: `View this shared ${onelink.type.toLowerCase()} on OneLink`
    }
}