import { httpClient } from "@/lib/httpClient";
import { UserAvatar } from "@/shared/ui/avatar";
import { VoteBadge } from "@/shared/ui/voteBadge";
import { ApiResponse, PostResponse } from "@chanban/shared-types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TAG_MAP } from "../domains/constants";
import { formatRelativeTime } from "./widgets/commentUtils";
import { TopicDetailContent } from "./widgets/topicDetailContent";

/**
 * 특정 토픽의 상세 정보를 조회합니다.
 * @param id - 토픽 ID
 * @returns 토픽 상세 정보 또는 null (실패 시)
 */
const getTopic = async (id: string): Promise<PostResponse | null> => {
  try {
    const response = await httpClient.get<ApiResponse<PostResponse>>(
      `/api/posts/${id}`
    );
    return response.data;
  } catch {
    return null;
  }
};

export default async function TopicDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const topic = await getTopic(id);

  if (!topic) {
    notFound();
  }

  const tagInfo = TAG_MAP[topic.tag] || { name: topic.tag };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[840px] mx-auto px-6 py-8">
        {/* 브레드크럼 */}
        <nav className="flex items-center gap-2 mb-6">
          <Link
            href="/topics"
            className="text-muted-foreground text-sm font-medium hover:underline"
          >
            홈
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link
            href={`/topics?tag=${topic.tag}`}
            className="text-muted-foreground text-sm font-medium hover:underline"
          >
            {tagInfo.name}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-primary text-sm font-semibold">토론</span>
        </nav>

        {/* 페이지 헤더 */}
        <header className="mb-8">
          <h1 className="text-3xl desktop:text-4xl font-black leading-tight tracking-[-0.033em] mb-4">
            {topic.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <UserAvatar user={topic.creator} size="sm" />
            <p className="text-muted-foreground text-sm">
              Posted by{" "}
              <span className="text-primary font-medium">
                @{topic.creator.nickname}
              </span>
              <span className="mx-1">•</span>
              <span>{formatRelativeTime(topic.createdAt)}</span>
              <span className="mx-1">in</span>
              <span className="font-medium">#{tagInfo.name}</span>
            </p>
            {topic.showCreatorOpinion && topic.creatorVote && (
              <VoteBadge status={topic.creatorVote} />
            )}
          </div>
        </header>

        {/* 본문 */}
        <article className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-lg leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {topic.content}
          </p>
        </article>

        {/* 투표 및 댓글 섹션 */}
        <TopicDetailContent topicId={id} commentCount={topic.commentCount} />
      </main>
    </div>
  );
}
