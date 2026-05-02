"use client";

import { topicDomains } from "@/app/topics/domains";
import { Button } from "@/shared/ui/button";
import { PostResponse } from "@chanban/shared-types";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import Link from "next/link";

const PREVIEW_LIMIT = 5;
const PREVIEW_QUERY_KEY = ["admin", "official-posts", "preview", PREVIEW_LIMIT] as const;

const TAG_LABEL: Record<string, string> = {
  politics: "정치",
  society: "사회",
  economy: "경제",
  technology: "기술",
  entertainment: "연예",
  sports: "스포츠",
  other: "기타",
};

/**
 * 어드민 대시보드용 — 최근 공식 토론 미리보기 (상위 N개).
 * 클릭 시 토픽 상세로 이동.
 */
export function RecentOfficialPostsPreview() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: PREVIEW_QUERY_KEY,
    queryFn: () => topicDomains.getOfficialPosts(1, PREVIEW_LIMIT),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          최근 공식 토론을 불러오지 못했습니다.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          다시 시도
        </Button>
      </div>
    );
  }

  const posts = data?.data ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Inbox className="w-8 h-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          아직 작성된 공식 토론이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
      {posts.map((post) => (
        <li key={post.id}>
          <RecentPostRow post={post} />
        </li>
      ))}
    </ul>
  );
}

function RecentPostRow({ post }: { post: PostResponse }) {
  return (
    <Link
      href={`/topics/${post.id}`}
      className="block px-4 py-3 hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground line-clamp-1">
            {post.title}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {post.content || "본문 없음"}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
          {TAG_LABEL[post.tag] ?? post.tag}
        </span>
      </div>
    </Link>
  );
}
