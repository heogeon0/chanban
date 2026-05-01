import { PostResponse } from "@chanban/shared-types";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { OfficialFeedCardInteractions } from "./officialFeedCardInteractions";

interface OfficialFeedCardProps {
  post: PostResponse;
}

const TAG_LABEL: Record<string, string> = {
  politics: "정치",
  society: "사회",
  economy: "경제",
  technology: "기술",
  entertainment: "연예",
  sports: "스포츠",
  other: "기타",
};

const LONG_CONTENT_THRESHOLD = 300;

/**
 * 메인 피드 공식 투표 카드 (RSC).
 * 정적 영역(헤더 / 제목 / 본문 / 페이드)만 서버에서 렌더하고,
 * 동적 영역(찬반바 / 버튼 / 메타 / 인기 댓글)은 client island에 위임한다.
 */
export function OfficialFeedCard({ post }: OfficialFeedCardProps) {
  const isLongContent =
    !!post.content && post.content.length > LONG_CONTENT_THRESHOLD;

  return (
    <Link href={`/topics/${post.id}`} className="block">
      <article className="flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* 헤더 */}
        <header className="flex items-center gap-2 px-4 pt-4 pb-2 shrink-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-sm dark:from-violet-400 dark:to-indigo-400">
            <ShieldCheck className="w-3 h-3" />
            공식
          </span>
          <span className="text-[13px] font-semibold text-foreground">
            {post.creator.nickname}
          </span>
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
            {TAG_LABEL[post.tag] ?? post.tag}
          </span>
        </header>

        {/* 제목 */}
        <h2 className="text-lg font-bold leading-tight px-4 pb-3 shrink-0">
          {post.title}
        </h2>

        {/* 본문 — 짧은 글은 자연 높이, 긴 글은 14줄 clamp + 하단 페이드로 "더 보기" 유도 */}
        <div className="relative px-4 pt-3 pb-3 border-t border-border/60">
          {post.content ? (
            <>
              <p
                className={`text-[14px] leading-relaxed text-foreground/85 whitespace-pre-wrap ${
                  isLongContent ? "line-clamp-[14]" : ""
                }`}
              >
                {post.content}
              </p>
              {isLongContent && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-8 h-16 bg-gradient-to-t from-card to-transparent" />
                  <div className="relative mt-2 text-right text-[12px] font-semibold text-primary">
                    본문 더 보기 →
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">본문이 없습니다.</p>
          )}
        </div>

        {/* 동적 영역 — client island */}
        <OfficialFeedCardInteractions post={post} />
      </article>
    </Link>
  );
}
