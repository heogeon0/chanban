"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { Home, PlusCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  {
    label: "홈",
    href: "/",
    icon: Home,
    isActive: (pathname: string) => pathname === "/",
    protected: false,
  },
  {
    label: "글쓰기",
    href: "/topics/create",
    icon: PlusCircle,
    isActive: (pathname: string) => pathname === "/topics/create",
    protected: true,
  },
  {
    label: "마이",
    href: "/my",
    icon: User,
    isActive: (pathname: string) => pathname.startsWith("/my"),
    protected: true,
  },
] as const;

/**
 * 모바일 하단 탭 네비게이션 바
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
      <div className="max-w-4xl mx-auto flex">
        {TABS.map(({ label, href, icon: Icon, isActive, protected: isProtected }) => {
          const active = isActive(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleClick(e, href, isProtected)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={active ? 2.5 : 1.75}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
