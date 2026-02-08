import { CreateTopicButton } from "@/shared/components/create-topic-button";
import { UserMenu } from "@/shared/components/user-menu";
import { Providers } from "@/shared/providers";
import "@/styles/globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Providers>
          {/* 헤더 */}
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 desktop:px-8 py-3 flex items-center justify-between">
              {/* 로고 */}
              <Link
                href="/topics"
                className="flex items-center gap-2 text-primary font-bold text-xl"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                  <span className="text-sm font-black">찬</span>
                </div>
                <span>찬반</span>
              </Link>

              {/* 네비게이션 & 액션 */}
              <div className="flex items-center gap-4">
                <CreateTopicButton />
                <UserMenu />
              </div>
            </div>

          </header>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* 모달 슬롯 */}
          {modal}
        </Providers>
      </body>
    </html>
  );
}
