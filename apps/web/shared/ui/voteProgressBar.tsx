import { memo } from 'react';

interface VoteProgressBarProps {
  agreeCount: number;
  disagreeCount: number;
  className?: string;
  height?: string;
}

/**
 * 찬성/반대 투표 비율을 시각적으로 표시하는 프로그레스 바 컴포넌트
 *
 * @param agreeCount - 찬성 투표 수
 * @param disagreeCount - 반대 투표 수
 * @param className - 추가 CSS 클래스
 */
export const VoteProgressBar = memo(function VoteProgressBar({
  agreeCount,
  disagreeCount,
  className = '',
  height = '50%'
}: VoteProgressBarProps) {
  const total = agreeCount + disagreeCount;
  const agreePercent = total === 0 ? 50 : (agreeCount / total) * 100;
  const disagreePercent = 100 - agreePercent;

  return (
    <div
      className={`absolute top-0 left-0 right-0  pointer-events-none ${className}`}
      role="meter"
      aria-label={`투표 비율: 찬성 ${Math.round(agreePercent)}%, 반대 ${Math.round(disagreePercent)}%`}
      aria-valuenow={agreePercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`찬성 ${agreeCount}표, 반대 ${disagreeCount}표`}
      style={{
        background: `linear-gradient(95deg,
          #a7c7e7 0%,
          #7eb3dd ${Math.max(0, agreePercent - 10)}%,
          #c4a8d8 ${agreePercent}%,
          #e8a8a8 ${Math.min(100, agreePercent + 10)}%,
          #ff9999 100%)`,
        opacity: 0.25,
        maskImage: 'linear-gradient(to bottom, black 0%, black 1%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 10%, transparent 100%)',
        height: height
      }}
    />
  );
});
