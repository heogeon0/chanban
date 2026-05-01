"use client";

import { useQuery } from "@tanstack/react-query";
import { topicQueries } from "@/shared/queries/topic";
import { PostResponse } from "@chanban/shared-types";
import Link from "next/link";
import { MessageSquare, Vote } from "lucide-react";
import { TAG_MAP } from "@/app/topics/domains/constants";
import { formatRelativeTime } from "@/app/topics/[id]/widgets/commentUtils";
import { TopicCarousel } from "./topicCarousel";

/**
 * 숫자를 포맷팅합니다 (1000 -> 1k)
 */
const formatCount = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

/**
 * 인기 1위 토픽을 풀-와이드 히어로 배너로 표시하는 컴포넌트
 */
function HeroBanner({ post }: { post: PostResponse }) {
  const total = post.agreeCount + post.disagreeCount;
  const agreePercent = total === 0 ? 50 : Math.round((post.agreeCount / total) * 100);
  const disagreePercent = total === 0 ? 50 : 100 - agreePercent;

  const tagInfo = TAG_MAP[post.tag] || { name: post.tag };

  return (
    <Link
      href={`/topics/${post.id}`}
      className="block rounded-2xl border border-border bg-card hover:bg-muted/10 transition-colors p-4"
    >
      {/* 태그 & 시간 */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {tagInfo.name}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 dark:bg-red-500/10">
            🔥 HOT
          </span>
        </div>
        <span className="text-[12px] text-muted-foreground">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* 제목 */}
      <h2 className="text-[15px] font-semibold mb-2 line-clamp-2">{post.title}</h2>

      {/* 내용 미리보기 */}
      {post.content && (
        <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
      )}

      {/* 3색 투표 바 (% 내장) */}
      <div className="flex gap-[3px] mb-3 rounded-lg overflow-hidden">
        <div
          className="h-[28px] flex items-center bg-opinion-agree rounded-l-lg"
          style={{ flex: agreePercent, paddingLeft: agreePercent > 15 ? '8px' : '2px' }}
        >
          {agreePercent > 15 && <span className="text-[12px] font-bold text-white">{agreePercent}%</span>}
        </div>
        <div
          className="h-[28px] flex items-center justify-end bg-opinion-disagree rounded-r-lg"
          style={{ flex: disagreePercent, paddingRight: disagreePercent > 15 ? '8px' : '2px' }}
        >
          {disagreePercent > 15 && <span className="text-[12px] font-bold text-white">{disagreePercent}%</span>}
        </div>
      </div>

      {/* 통계 */}
      <div className="flex items-center gap-3 pt-2.5 border-t border-border text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Vote className="w-3 h-3" />
          {formatCount(total)}명 투표
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {formatCount(post.commentCount)}
        </span>
      </div>
    </Link>
  );
}

/**
 * 인기 토픽 섹션 컴포넌트
 * 1위 → 히어로 배너, 2~4위 → 오토 캐러셀
 * 비로그인 포함 모든 사용자에게 노출됩니다.
 */
export function HotTopicsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["feed", "hot"],
    queryFn: () => topicQueries.list("hot", 1).queryFn(),
  });

  const topics = data?.data.slice(0, 4) ?? [];

  if (isLoading) {
    return (
      <section className="py-6">
        <div className="max-w-4xl mx-auto w-full px-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-52 bg-muted rounded-xl animate-pulse" />
          <div className="h-32 bg-muted rounded-xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (topics.length === 0) return null;

  const [hero, ...rest] = topics as [PostResponse, ...PostResponse[]];

  return (
    <section className="px-3 pt-3 pb-1 space-y-3">
      <HeroBanner post={hero} />
      {rest.length > 0 && <TopicCarousel topics={rest} />}
    </section>
  );
}
