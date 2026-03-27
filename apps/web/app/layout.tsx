import { BottomTabBar } from "@/shared/components/bottom-tab-bar";
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
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <Providers>
          {/* 헤더 */}
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="px-4 py-3 flex items-center justify-between">
              {/* 로고 */}
              <Link
                href="/"
                className="flex items-center gap-2 text-primary font-bold text-xl"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                  <span className="text-sm font-black">찬</span>
                </div>
                <span>찬반</span>
              </Link>

              <UserMenu />
            </div>

          </header>

          {/* 메인 콘텐츠 — 탭바 높이만큼 하단 패딩 */}
          <main className="flex-1 flex flex-col pb-16">{children}</main>

          {/* 모달 슬롯 */}
          {modal}

          {/* 하단 탭바 */}
          <BottomTabBar />
        </Providers>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
