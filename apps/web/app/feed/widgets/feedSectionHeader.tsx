import Link from "next/link";

interface FeedSectionHeaderProps {
  title: string;
  moreHref: string;
  moreLabel?: string;
}

/**
 * 피드 섹션의 제목과 "더보기" 링크를 표시하는 공통 헤더 컴포넌트
 * @param title - 섹션 제목
 * @param moreHref - "더보기" 링크 URL
 * @param moreLabel - "더보기" 링크 텍스트 (기본값: "더보기")
 */
export function FeedSectionHeader({
  title,
  moreHref,
  moreLabel = "더보기",
}: FeedSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <Link
        href={moreHref}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {moreLabel} →
      </Link>
    </div>
  );
}
