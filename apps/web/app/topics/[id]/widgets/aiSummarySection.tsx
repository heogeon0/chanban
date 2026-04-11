"use client";

import { summaryQueries } from "@/shared/queries/topic";
import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";

interface AiSummarySectionProps {
  topicId: string;
}

/**
 * AI 요약 섹션
 * 그라데이션 카드로 토픽 요약 + 찬성/반대 의견 분석을 표시합니다.
 */
export function AiSummarySection({ topicId }: AiSummarySectionProps) {
  const { data, isLoading } = useQuery({
    ...summaryQueries.get(topicId),
    retry: false,
  });

  if (isLoading) return <AiSummarySkeleton />;
  if (!data) return null;

  const hasContent =
    data.contentSummary || data.voteSummary || data.agreeSummary || data.disagreeSummary;
  if (!hasContent) return null;

  return (
    <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-ai-summary-from to-ai-summary-to border border-ai-summary-border">
      {/* 헤더 */}
      <div className="flex items-center gap-1.5 px-5 py-4">
        <Sparkles className="size-4 text-ai-summary-accent shrink-0" />
        <h3 className="text-[13px] font-bold">AI 요약</h3>
        <span className="ml-auto text-[10px] text-muted-foreground font-medium">Gemini</span>
      </div>

      <div className="px-5 pb-4 space-y-3">
        {/* 토픽 요약 */}
        {(data.contentSummary || data.voteSummary) && (
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {data.contentSummary || data.voteSummary}
          </p>
        )}

        {/* 찬성/반대 핵심 포인트 */}
        <div className="flex flex-col gap-2">
          {data.agreeSummary && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-opinion-agree" />
              <span className="text-[12px] text-muted-foreground">
                <span className="font-semibold text-opinion-agree">찬성 측: </span>
                {data.agreeSummary}
              </span>
            </div>
          )}
          {data.disagreeSummary && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-opinion-disagree" />
              <span className="text-[12px] text-muted-foreground">
                <span className="font-semibold text-opinion-disagree">반대 측: </span>
                {data.disagreeSummary}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AiSummarySkeleton() {
  return (
    <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-ai-summary-from to-ai-summary-to border border-ai-summary-border">
      <div className="flex items-center gap-1.5 px-5 py-4">
        <div className="size-4 rounded bg-ai-summary-border animate-pulse" />
        <div className="h-4 w-16 rounded bg-ai-summary-border animate-pulse" />
      </div>
      <div className="px-5 pb-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-ai-summary-border/60 animate-pulse" />
        <div className="h-3.5 w-4/5 rounded bg-ai-summary-border/60 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-ai-summary-border/60 animate-pulse" />
      </div>
    </section>
  );
}
