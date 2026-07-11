import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono, Kalam } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const handwriting = Kalam({
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Inkleaf — Markdown, Typeset",
  description:
    "Write Markdown on the left, watch it become a typeset manuscript on the right.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} ${handwriting.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans bg-ink-900 text-ink-100 antialiased">
        <ClerkProvider publishableKey="pk_test_bmV3LWNyYWItNi5jbGVyay5hY2NvdW50cy5kZXYk" afterSignOutUrl="/">
          <header className="sr-only">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
