"use client";

import { memo } from "react";

interface VoteDistributionBarProps {
  agreeCount: number;
  disagreeCount: number;
  neutralCount: number;
}

/** 최소 표시 너비 퍼센트 (너무 작으면 숫자가 안 보임) */
const MIN_DISPLAY_WIDTH = 15;

/**
 * 투표 분포를 3색 막대 그래프로 표시하는 컴포넌트
 *
 * @param agreeCount - 찬성 투표 수
 * @param disagreeCount - 반대 투표 수
 * @param neutralCount - 중립 투표 수
 */
export const VoteDistributionBar = memo(function VoteDistributionBar({
  agreeCount,
  disagreeCount,
  neutralCount,
}: VoteDistributionBarProps) {
  const total = agreeCount + disagreeCount + neutralCount;

  const agreePercent =
    total === 0 ? 33 : Math.round((agreeCount / total) * 100);
  const disagreePercent =
    total === 0 ? 33 : Math.round((disagreeCount / total) * 100);
  const neutralPercent =
    total === 0 ? 34 : 100 - agreePercent - disagreePercent;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-bold text-muted-foreground">
          현재 투표 현황
        </span>
        <span className="text-xs text-muted-foreground">
          총 {total.toLocaleString()}표
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div
        className="w-full h-10 flex rounded-full overflow-hidden border-4 border-background/50"
        role="meter"
        aria-label={`투표 비율: 찬성 ${agreePercent}%, 반대 ${disagreePercent}%, 중립 ${neutralPercent}%`}
      >
        {agreePercent > 0 && (
          <div
            className="bg-primary h-full flex items-center justify-center text-xs font-black text-white transition-all"
            style={{ width: `${agreePercent}%` }}
          >
            {agreePercent >= MIN_DISPLAY_WIDTH && `${agreePercent}%`}
          </div>
        )}
        {disagreePercent > 0 && (
          <div
            className="bg-destructive h-full flex items-center justify-center text-xs font-black text-white transition-all"
            style={{ width: `${disagreePercent}%` }}
          >
            {disagreePercent >= MIN_DISPLAY_WIDTH && `${disagreePercent}%`}
          </div>
        )}
        {neutralPercent > 0 && (
          <div
            className="bg-muted-foreground h-full flex items-center justify-center text-xs font-black text-white transition-all"
            style={{ width: `${neutralPercent}%` }}
          >
            {neutralPercent >= MIN_DISPLAY_WIDTH && `${neutralPercent}%`}
          </div>
        )}
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">찬성</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">반대</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
          <span className="text-xs text-muted-foreground">중립</span>
        </div>
      </div>
    </div>
  );
});
