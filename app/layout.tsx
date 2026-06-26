import { Geist_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

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
            <main className="w-11/12 max-w-7xl mx-auto flex-1 flex flex-col">
              {children}
              <Toaster
                theme="dark"
                richColors
                position="top-center"
                toastOptions={{
                  classNames: {
                    toast:
                      "font-mono text-sm border border-border shadow-lg",
                    title: "text-foreground text-sm",
                    description: "text-muted-foreground text-xs",
                    closeButton:
                      "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
                    success:
                      "border-primary/30 bg-card [&_[data-icon]]:text-primary",
                    error:
                      "border-destructive/30 bg-card [&_[data-icon]]:text-destructive",
                  },
                }}
              />
            </main>
          </div>
      </body>
    </html>
  )
}
