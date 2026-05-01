import { BottomTabBar } from "@/shared/components/bottom-tab-bar";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { UserMenu } from "@/shared/components/user-menu";
import { Providers } from "@/shared/providers";
import "@/styles/globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s | 찬반",
    default: "찬반 - 함께 토론하는 찬반 플랫폼",
  },
  description:
    "사회, 정치, 경제, 기술 이슈에 대해 찬반 의견을 나누는 토론 플랫폼",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-background">
        <Providers>
          {/* 헤더 */}
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
            <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
              {/* 로고 */}
              <Link href="/" className="flex items-center gap-0.5">
                <span className="text-[22px] font-extrabold tracking-tight text-foreground">찬반</span>
                <span className="text-[22px] font-extrabold tracking-tight text-primary">토론</span>
              </Link>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full pb-24">
            {children}
          </main>

          {modal}
          <BottomTabBar />
        </Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
