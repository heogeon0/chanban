
import { httpClient } from "@/lib/httpClient";
import { PaginatedResponse, PostResponse, PostTag, TAGS } from "@chanban/shared-types";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";


const TAG_MAP = {
  'hot': {
    id: 'hot',
    name: "인기",
    variant: 'agree' as const,
  },
  'recent': {
    id: 'recent',
    name: "최신",
    variant: 'disagree' as const,
  },
  [PostTag.POLITICS]: {
    id: PostTag.POLITICS,
    name: "정치",
    variant: 'default' as const,
  },
  [PostTag.SOCIETY]: {
    id: PostTag.SOCIETY,
    name: "사회",
    variant: 'default' as const,
  },
  [PostTag.ECONOMY]: {
    id: PostTag.ECONOMY,
    name: "경제",
    variant: 'default' as const,
  },
  [PostTag.TECHNOLOGY]: {
    id: PostTag.TECHNOLOGY,
    name: "기술",
    variant: 'default' as const,
  },
  [PostTag.ENTERTAINMENT]: {
    id: PostTag.ENTERTAINMENT,
    name: "연예",
    variant: 'default' as const,
  },
    [PostTag.SPORTS]: {
    id: PostTag.SPORTS,
    name: "스포츠",
    variant: 'default' as const,
  },
  [PostTag.OTHER]: {
    id: PostTag.OTHER,
    name: "기타",
    variant: 'default' as const,
  },
}

/**
 * 찬성/반대 비율을 퍼센트로 계산합니다.
 * @param agreeCount 찬성 투표 수
 * @param disagreeCount 반대 투표 수
 * @returns 찬성 비율 (0-100)
 */
function getAgreePercentage(agreeCount: number, disagreeCount: number): number {
  const total = agreeCount + disagreeCount;
  if (total === 0) return 50; // 투표가 없으면 중립
  return (agreeCount / total) * 100;
}

/**
 * 날짜를 상대적인 시간으로 포맷합니다.
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷된 날짜 문자열 (예: "2시간 전", "3일 전")
 */
function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;

  // 일주일 이상이면 날짜 표시
  return target.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function getPosts(tag?: PostTag | 'recent' | 'hot') {

  if (tag === 'recent') {
    return await httpClient.get<PaginatedResponse<PostResponse>>(`/api/posts/recent`);
  }

  if (tag === 'hot') {
    return await httpClient.get<PaginatedResponse<PostResponse>>(`/api/posts/recent?sort=popular`);
  }

  return await httpClient.get<PaginatedResponse<PostResponse>>(`/api/posts/tags/${tag}`);
}









export default async function TopicsPage({ searchParams }: { searchParams: { tag: string } }) {
 const { tag } = await searchParams;
  const posts = await getPosts(TAGS.includes(tag as PostTag) ? tag as PostTag : 'hot');

  return (
    <div>
      <header>
        <ul className="flex flex-wrap gap-x-2 border-b py-4">
          {Object.values(TAG_MAP).map((tag, index) => (
            <li key={tag.id} aria-label={`${index + 1}번째 카테고리`}>
              <Badge asChild variant={tag.variant}>
                <Link href={`/topics?tag=${tag.id}`}>
                  {tag.name}
                </Link>
              </Badge>
            </li>
          ))}
        </ul>
      </header>
      <main className="p-4">
        <ul className="flex flex-col gap-y-3">
          {posts.data.map((post) => {
            const agreePercent = getAgreePercentage(post.agreeCount, post.disagreeCount);

            return (
              <li key={post.id}>
                <Link
                  href={`/topics/${post.id}`}
                  className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
                >
                  {/* 상단 프로그레스 바 - 비스듬하게 섞이는 그라디언트 */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[50%] pointer-events-none"
                      style={{
                      background: `linear-gradient(95deg,
                        #a7c7e7 0%,
                        #7eb3dd ${Math.max(0, agreePercent - 10)}%,
                        #c4a8d8 ${agreePercent}%,
                        #e8a8a8 ${Math.min(100, agreePercent + 10)}%,
                        #ff9999 100%)`,
                      opacity: 0.25,
                      maskImage: 'linear-gradient(to bottom, black 0%, black 1%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 10%, transparent 100%)'
                      }}
                    />

                  {/* 카드 본문 */}
                  <div className="p-4 relative">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* 내용 미리보기 */}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                      {post.content}
                    </p>

                    {/* 투표 통계 */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-blue-600 font-medium">
                        👍 {post.agreeCount}
                      </span>
                      <span className="text-red-600 font-medium">
                        👎 {post.disagreeCount}
                      </span>
                      <span className="text-gray-500">
                        ○ {post.neutralCount}
                      </span>
                      <span className="ml-auto text-gray-400 text-xs">
                        💬 {post.commentCount}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
