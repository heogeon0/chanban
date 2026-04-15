"use client";

import { memo } from "react";

interface VoteDistributionBarProps {
  agreeCount: number;
  disagreeCount: number;
  /** 레거시 호환용 — 표시에는 사용되지 않음 (중립 투표는 집계에서 제외) */
  neutralCount?: number;
  hasVoted?: boolean;
}

/** 최소 표시 너비 퍼센트 (너무 작으면 숫자가 안 보임) */
const MIN_DISPLAY_WIDTH = 15;

/**
 * 투표 분포를 찬/반 2색 막대 그래프로 표시
 * 중립은 계산에서 제외하여 agree:disagree 비율만 표시
 * 투표 전에는 opacity-50으로 흐릿하게, 투표 후 선명하게 표시
 */
export const VoteDistributionBar = memo(function VoteDistributionBar({
  agreeCount,
  disagreeCount,
  hasVoted = false,
}: VoteDistributionBarProps) {
  const total = agreeCount + disagreeCount;

  const agreePercent =
    total === 0 ? 50 : Math.round((agreeCount / total) * 100);
  const disagreePercent = total === 0 ? 50 : 100 - agreePercent;

  return (
    <div
      className={`transition-opacity duration-300 ${
        hasVoted ? "opacity-100" : "opacity-50"
      }`}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-semibold text-muted-foreground">
          {hasVoted ? "투표 완료" : "당신의 의견은?"}
        </span>
        {hasVoted && (
          <span className="text-[12px] text-muted-foreground">
            총 {total.toLocaleString()}표
          </span>
        )}
      </div>

      {/* 프로그레스 바 */}
      <div
        className="flex gap-[3px] rounded-lg overflow-hidden"
        role="meter"
        aria-label={`투표 비율: 찬성 ${agreePercent}%, 반대 ${disagreePercent}%`}
      >
        <div
          className="h-8 bg-opinion-agree flex items-center rounded-l-lg"
          style={{
            flex: agreePercent,
            paddingLeft: agreePercent >= MIN_DISPLAY_WIDTH ? "10px" : "2px",
          }}
        >
          {agreePercent >= MIN_DISPLAY_WIDTH && (
            <span className="text-[12px] font-bold text-white">
              찬성 {agreePercent}%
            </span>
          )}
        </div>
        <div
          className="h-8 bg-opinion-disagree flex items-center justify-end rounded-r-lg"
          style={{
            flex: disagreePercent,
            paddingRight:
              disagreePercent >= MIN_DISPLAY_WIDTH ? "10px" : "2px",
          }}
        >
          {disagreePercent >= MIN_DISPLAY_WIDTH && (
            <span className="text-[12px] font-bold text-white">
              반대 {disagreePercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
