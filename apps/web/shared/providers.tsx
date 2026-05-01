"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { AuthProvider } from "./contexts/auth-context";
import { isHttpError } from "@/lib/httpClient";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              // 인증 에러는 httpClient에서 refresh 처리하므로 retry 불필요
              if (isHttpError(error) && error.status === 401) return false;
              if (error instanceof Error && error.message.includes('인증이 만료')) return false;
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          enableColorScheme
        >
          {children}
        </NextThemesProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
