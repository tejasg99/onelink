import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { TextForm } from "@/components/forms/text-form"
import { CodeForm } from "@/components/forms/code-form"
import { FileForm } from "@/components/forms/file-form"
import { LinksForm } from "@/components/forms/links-form"

export default async function NewPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Link</h1>
        <p className="mt-1 text-muted-foreground">
          Choose a content type and share it with a single link
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-4">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Icons.text className="h-4 w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Icons.code className="h-4 w-4" />
              <span className="hidden sm:inline">Code</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Icons.file className="h-4 w-4" />
              <span className="hidden sm:inline">File</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Icons.links className="h-4 w-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <TextForm />
          </TabsContent>

          <TabsContent value="code">
            <CodeForm />
          </TabsContent>

          <TabsContent value="file">
            <FileForm />
          </TabsContent>

          <TabsContent value="links">
            <LinksForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}