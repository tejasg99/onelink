import Link from "next/link"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

const features = [
  {
    icon: Icons.text,
    title: "Text & Notes",
    description: "Share markdown-formatted text with syntax highlighting and easy copying.",
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
    description: "Create a beautiful profile page with all your important links.",
  },
]

const stats = [
  { value: "100K+", label: "Links Created" },
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
]

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-b from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-950" />
          <div className="absolute left-1/2 top-0 -z-10 h-150 w-150 -translate-x-1/2 rounded-full bg-linear-to-b from-neutral-200/50 to-transparent blur-3xl dark:from-neutral-800/50" />
        </div>

        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
              Now with Link-in-Bio pages
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Share anything with
              <span className="block bg-linear-to-r from-neutral-600 to-neutral-900 bg-clip-text text-transparent dark:from-neutral-400 dark:to-white">
                a single link
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-lg text-neutral-600 dark:text-neutral-400 sm:text-xl">
              Text, code, files, or your entire link collection. 
              Create expiring links with privacy controls in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
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
                <Link href="#features">
                  Learn more
                </Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-neutral-500 dark:text-neutral-400">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-neutral-900 dark:text-white">
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
      <section id="features" className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to share
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Four powerful ways to share content, all with built-in privacy and expiration controls.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-neutral-200 bg-white p-8 transition-all hover:border-neutral-300 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                  <feature.icon className="h-6 w-6 text-neutral-700 dark:text-neutral-300" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-400">
              Create your first link in seconds. No credit card required.
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <Link href={session ? "/new" : "/login"}>
                Get started for free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-900 dark:bg-white">
                <Icons.link className="h-3 w-3 text-white dark:text-neutral-900" />
              </div>
              <span className="font-semibold">OneLink</span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              © {new Date().getFullYear()} OneLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
