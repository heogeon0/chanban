import { PostTag } from "@chanban/shared-types";
import Link from "next/link";

const CATEGORIES = [
  {
    tag: PostTag.POLITICS,
    name: "정치",
    emoji: "🏛️",
    colorClass: "from-blue-500/20 to-blue-600/10 border-blue-200 dark:border-blue-900",
    emojiClass: "text-blue-500",
  },
  {
    tag: PostTag.ECONOMY,
    name: "경제",
    emoji: "📈",
    colorClass: "from-emerald-500/20 to-emerald-600/10 border-emerald-200 dark:border-emerald-900",
    emojiClass: "text-emerald-500",
  },
  {
    tag: PostTag.TECHNOLOGY,
    name: "기술",
    emoji: "💻",
    colorClass: "from-violet-500/20 to-violet-600/10 border-violet-200 dark:border-violet-900",
    emojiClass: "text-violet-500",
  },
  {
    tag: PostTag.SOCIETY,
    name: "사회",
    emoji: "🌍",
    colorClass: "from-orange-500/20 to-orange-600/10 border-orange-200 dark:border-orange-900",
    emojiClass: "text-orange-500",
  },
  {
    tag: PostTag.ENTERTAINMENT,
    name: "연예",
    emoji: "🎬",
    colorClass: "from-pink-500/20 to-pink-600/10 border-pink-200 dark:border-pink-900",
    emojiClass: "text-pink-500",
  },
  {
    tag: PostTag.SPORTS,
    name: "스포츠",
    emoji: "⚽",
    colorClass: "from-lime-500/20 to-lime-600/10 border-lime-200 dark:border-lime-900",
    emojiClass: "text-lime-600",
  },
  {
    tag: PostTag.OTHER,
    name: "기타",
    emoji: "💬",
    colorClass: "from-slate-500/20 to-slate-600/10 border-slate-200 dark:border-slate-800",
    emojiClass: "text-slate-500",
  },
] as const;

/**
 * 카테고리 탐색 그리드
 * 각 카테고리 카드 클릭 시 해당 태그 필터 홈으로 이동합니다.
 */
export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map(({ tag, name, emoji, colorClass, emojiClass }) => (
        <Link
          key={tag}
          href={`/?tag=${tag}`}
          className={`rounded-2xl border bg-gradient-to-br ${colorClass} p-4 flex items-center gap-3 transition-opacity hover:opacity-80 active:opacity-60`}
        >
          <span className={`text-2xl ${emojiClass}`}>{emoji}</span>
          <span className="text-[15px] font-semibold">{name}</span>
        </Link>
      ))}
    </div>
  );
}
