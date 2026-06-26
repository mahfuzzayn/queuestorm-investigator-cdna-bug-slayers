import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE } from "@/lib/site-data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueueStorm Investigator",
  description: "MFS support ticket analysis system — SUST Hackathon 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
        <footer className="border-t-2 border-[var(--border)] bg-[var(--card)]">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
            <p className="text-xs font-bold tracking-wider text-[var(--muted-foreground)]">
              {SITE.projectName} &mdash; {SITE.competition}
            </p>
            <Link
              href="/team"
              className="inline-flex items-center gap-1.5 border-2 border-[var(--border)] px-3 py-1 text-xs font-bold tracking-wider shadow-neo-sm press-inner transition-all duration-150 hover:bg-[var(--muted)]"
            >
              {SITE.teamName.replace(/_/g, " ")}
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
