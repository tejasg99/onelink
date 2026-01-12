import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Header } from "@/components/header";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "OneLink - Secure Link & Content Sharing",
  description: "Share text, code, files, and links with a single URL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <div className="relative min-h-screen">
              <Header />
              <main>{children}</main>
            </div>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
