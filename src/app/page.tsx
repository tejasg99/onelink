import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

const features = [
  {
    icon: Icons.text,
    title: "Text & Notes",
    description:
      "Share markdown-formatted text with syntax highlighting and easy copying.",
  },
  {
    icon: Icons.code,
    title: "Code Snippets",
    description: "Share code with syntax highlighting for 100+ languages.",
  },
  {
    icon: Icons.file,
    title: "File Sharing",
    description: "Upload and share files up to 20MB with automatic expiry.",
  },
  {
    icon: Icons.links,
    title: "Link in Bio",
    description:
      "Create a beautiful profile page with all your important links.",
  },
]

const stats = [
  { value: "100K+", label: "Links Created" },
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
]

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-b from-muted/50 to-background" />
          <div className="absolute left-1/2 top-0 -z-10 h-150 w-150 -translate-x-1/2 rounded-full bg-linear-to-b from-muted to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-border bg-background px-4 py-1.5 text-sm">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
              Now with Link-in-Bio pages
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Share anything with
              <span className="block bg-linear-to-r from-muted-foreground to-foreground bg-clip-text">
                a single link
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Text, code, files, or your entire link collection. Create expiring
              links with privacy controls in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base bg-foreground text-background hover:bg-foreground/90"
              >
                <Link href={session ? "/new" : "/login"}>
                  <Icons.plus className="mr-2 h-5 w-5" />
                  Create your first link
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base"
              >
                <Link href="/browse">
                  <Icons.globe className="mr-2 h-5 w-5" />
                  Browse public links
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to share
            </h2>
            <p className="text-lg text-muted-foreground">
              Four powerful ways to share content, all with built-in privacy and
              expiration controls.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <feature.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Section - New! */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Discover what others are sharing
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Browse public snippets, code, and links shared by our community.
              Get inspired or find useful resources.
            </p>
            <Button asChild size="lg" variant="outline">
              <Link href="/browse">
                <Icons.globe className="mr-2 h-5 w-5" />
                Explore public links
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Create your first link in seconds. No credit card required.
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base bg-foreground text-background hover:bg-foreground/90"
            >
              <Link href={session ? "/new" : "/login"}>
                Get started for free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <Icons.link className="h-3 w-3 text-background" />
              </div>
              <span className="font-semibold">OneLink</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/browse"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse
              </Link>
              <Link
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} OneLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}