import { VoteProgressBar } from "@/components/voteProgressBar";
import { PostResponse } from "@chanban/shared-types";
import Link from "next/link";

interface TopicCardProps {
  post: PostResponse;
}

/**
 * 토픽 목록에서 사용되는 카드 컴포넌트
 * 제목, 내용 미리보기, 투표 통계를 표시합니다.
 *
 * @param post - 게시글 데이터
 */
export function TopicCard({ post }: TopicCardProps) {
  return (
    <Link
      href={`/topics/${post.id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
    >
      <VoteProgressBar
        agreeCount={post.agreeCount}
        disagreeCount={post.disagreeCount}
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
  );
}
