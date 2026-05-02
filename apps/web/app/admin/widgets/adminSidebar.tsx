"use client";

import { LayoutDashboard, ListChecks, PenSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminMenuItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  /**
   * 현재 경로에 대한 active 매칭.
   * "/admin"은 정확히 일치할 때만 active.
   * 하위 경로가 있는 메뉴는 startsWith로 매칭.
   */
  isActive: (pathname: string) => boolean;
}

const ADMIN_MENU: AdminMenuItem[] = [
  {
    label: "메인",
    href: "/admin",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/admin",
  },
  {
    label: "공식 토론 목록",
    href: "/admin/posts",
    icon: ListChecks,
    isActive: (pathname) =>
      pathname === "/admin/posts" ||
      (pathname.startsWith("/admin/posts/") &&
        !pathname.startsWith("/admin/posts/create")),
  },
  {
    label: "공식 토론 작성",
    href: "/admin/posts/create",
    icon: PenSquare,
    isActive: (pathname) => pathname.startsWith("/admin/posts/create"),
  },
];

/**
 * 어드민 사이드바.
 * - 데스크톱: 좌측 고정 세로 메뉴
 * - 모바일: 상단 가로 스크롤 탭
 */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* 모바일: 상단 가로 탭 */}
      <nav className="md:hidden sticky top-[57px] z-40 -mx-5 px-5 bg-background/95 backdrop-blur-md border-b border-border">
        <ul className="flex gap-2 overflow-x-auto py-3 scrollbar-none">
          {ADMIN_MENU.map(({ label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 데스크톱: 좌측 사이드바 */}
      <aside className="hidden md:block w-56 shrink-0">
        <nav className="sticky top-20">
          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            어드민
          </div>
          <ul className="space-y-1">
            {ADMIN_MENU.map(({ label, href, icon: Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
