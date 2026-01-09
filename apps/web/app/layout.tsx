
import { Providers } from "@/shared/providers"
import "@workspace/ui/globals.css"
import { Button } from "@workspace/ui/components/button"
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
        <header className="border-b p-4 flex items-center justify-between">
        <Link
          href="/topics"
          className="text-body-default text-muted-foreground hover:text-foreground"
        >
          ← 목록으로
        </Link>
        <Button asChild size="sm">
          <Link href="/topics/create">
            새 주제 쓰기
          </Link>
        </Button>
      </header>
          {children}</Providers>
      </body>
    </html>
  )
}
