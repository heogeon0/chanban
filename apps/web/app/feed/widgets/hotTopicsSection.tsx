"use client";

import { useQuery } from "@tanstack/react-query";
import { topicQueries } from "@/shared/queries/topic";
import { FeedSectionHeader } from "./feedSectionHeader";
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
  const total = post.agreeCount + post.disagreeCount + post.neutralCount;
  const agreePercent = total === 0 ? 33 : Math.round((post.agreeCount / total) * 100);
  const neutralPercent = total === 0 ? 34 : Math.round((post.neutralCount / total) * 100);
  const disagreePercent = total === 0 ? 33 : 100 - agreePercent - neutralPercent;

  const tagInfo = TAG_MAP[post.tag] || { name: post.tag };

  return (
    <Link
      href={`/topics/${post.id}`}
      className="block rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors overflow-hidden"
    >
      <div className="p-5">
        {/* 태그 & 시간 */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wide">
            {tagInfo.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>

        {/* 내용 미리보기 */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{post.content}</p>

        {/* 찬반 퍼센트 레이블 */}
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-opinion-agree">찬성 {agreePercent}%</span>
          <span className="text-muted-foreground">중립 {neutralPercent}%</span>
          <span className="text-opinion-disagree">반대 {disagreePercent}%</span>
        </div>

        {/* 3색 프로그레스 바 */}
        <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted mb-4">
          <div className="bg-opinion-agree h-full transition-all" style={{ width: `${agreePercent}%` }} />
          <div className="bg-muted-foreground h-full transition-all" style={{ width: `${neutralPercent}%` }} />
          <div className="bg-opinion-disagree h-full transition-all" style={{ width: `${disagreePercent}%` }} />
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Vote className="w-4 h-4" />
            <span className="font-semibold text-foreground">{formatCount(total)}</span>명 참여
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            {formatCount(post.commentCount)}
          </span>
        </div>
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
      <section className="px-4 py-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-52 bg-muted rounded-xl animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </section>
    );
  }

  if (topics.length === 0) return null;

  const [hero, ...rest] = topics as [PostResponse, ...PostResponse[]];

  return (
    <section className="px-4 py-6 space-y-3">
      <FeedSectionHeader
        title="🔥 인기 토픽"
        moreHref="/topics?sort=popular"
        moreLabel="더보기"
      />
      <HeroBanner post={hero} />
      {rest.length > 0 && <TopicCarousel topics={rest} />}
    </section>
  );
}
