"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { Bell, Home, Search, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  {
    label: "커뮤니티",
    href: "/topics",
    icon: Users,
    isActive: (pathname: string) => pathname.startsWith("/topics"),
    protected: false,
    isFab: false,
  },
  {
    label: "탐색",
    href: "/search",
    icon: Search,
    isActive: (pathname: string) => pathname.startsWith("/search"),
    protected: false,
    isFab: false,
  },
  {
    label: "홈",
    href: "/",
    icon: Home,
    isActive: (pathname: string) => pathname === "/",
    protected: false,
    isFab: true,
  },
  {
    label: "알림",
    href: "/notifications",
    icon: Bell,
    isActive: (pathname: string) => pathname.startsWith("/notifications"),
    protected: true,
    isFab: false,
  },
  {
    label: "마이",
    href: "/my",
    icon: User,
    isActive: (pathname: string) => pathname.startsWith("/my"),
    protected: true,
    isFab: false,
  },
] as const;

/**
 * 모바일 하단 탭 네비게이션 바
 * 5탭 구성 (홈/탐색/글쓰기FAB/알림/마이)
 * 인증이 필요한 탭은 비로그인 시 로그인 페이지로 이동합니다.
 */
export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleClick = (
    e: React.MouseEvent,
    href: string,
    isProtected: boolean
  ) => {
    if (isProtected && !isAuthenticated) {
      e.preventDefault();
      router.push(`/auth/login?returnUrl=${href}`);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex items-center pt-2 pb-6">
        {TABS.map(({ label, href, icon: Icon, isActive, protected: isProtected, isFab }) => {
          const active = isActive(pathname);

          if (isFab) {
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleClick(e, href, isProtected)}
                className="flex-1 flex flex-col items-center -mt-4"
              >
                <div
                  className={`w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-transform ${
                    active ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleClick(e, href, isProtected)}
              className={`flex-1 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
