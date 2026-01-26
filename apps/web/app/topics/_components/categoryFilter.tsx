import { PostTag } from "@chanban/shared-types";
import Link from "next/link";
import { CATEGORY_FILTERS } from "../_constants";

interface CategoryFilterProps {
  selectedTag: PostTag | "all";
  selectedSort: string;
}

/**
 * 토픽 목록 페이지의 카테고리 필터 컴포넌트
 * 카테고리별로 필터링할 수 있는 탭 버튼을 렌더링합니다.
 */
export function CategoryFilter({
  selectedTag,
  selectedSort,
}: CategoryFilterProps) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORY_FILTERS.map((category) => {
        const isActive =
          selectedTag === category.id ||
          (category.id === "all" && selectedTag === "all");
        return (
          <Link
            key={category.id}
            href={`/topics?tag=${category.id}&sort=${selectedSort}`}
            className={`px-3 desktop:px-4 py-1.5 desktop:py-2 rounded-full text-xs desktop:text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
