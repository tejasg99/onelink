import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
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
        <SessionProvider>
          <div className="relative min-h-screen">
            <Header />
            <main>{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
