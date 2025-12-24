import { BanIcon, ChanIcon, ChongIcon } from "@/shared/ui/icons";
import { VoteProgressBar } from "@/shared/ui/voteProgressBar";
import { PostResponse } from "@chanban/shared-types";
import CommentIcon from '@mui/icons-material/Comment';
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
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <ChanIcon size={16} />
            {post.agreeCount}
          </span>
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <BanIcon size={16} />
            {post.disagreeCount}
          </span>
          <span className="flex items-center gap-1 text-gray-500">
            <ChongIcon size={16} />
            {post.neutralCount}
          </span>
          <span className="ml-auto flex items-center gap-1 text-gray-500">
            <CommentIcon sx={{ fontSize: 16 }} />
            {post.commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
}
