import { Geist_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Advent",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceGrotesk.variable
      )}
    >
      <body className="flex flex-col min-h-dvh">
          <div className="flex flex-col flex-1">
            <Navbar />
            <main className="w-4/5 max-w-6xl mx-auto flex-1 flex flex-col">
              {children}
            </main>
          </div>
      </body>
    </html>
  )
}
