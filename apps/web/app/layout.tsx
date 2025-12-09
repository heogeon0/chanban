
import { Providers } from "@/components/providers"
import "@workspace/ui/globals.css"


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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
