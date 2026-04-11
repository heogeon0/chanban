"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * 라이트/다크 모드 토글 버튼
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-8 h-8 rounded-full flex items-center justify-center bg-muted transition-colors hover:bg-muted/80"
      aria-label="테마 전환"
    >
      <Sun className="w-4 h-4 hidden dark:block text-muted-foreground" />
      <Moon className="w-4 h-4 block dark:hidden text-muted-foreground" />
    </button>
  );
}
