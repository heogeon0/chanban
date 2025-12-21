
import { Providers } from "@/components/providers"
import "@workspace/ui/globals.css"
import Link from "next/link"


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans antialiased w-[375px] mx-auto`}
      >
        <Providers>
        <header className="border-b p-4">
        <Link
          href="/topics"
          className="text-body-default text-muted-foreground hover:text-foreground"
        >
          ← 목록으로
        </Link>
      </header>
          {children}</Providers>
      </body>
    </html>
  )
}
