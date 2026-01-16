import { httpClient } from "@/lib/httpClient";
import { VoteProgressBar } from "@/shared/ui/voteProgressBar";
import { ApiResponse, PostResponse } from "@chanban/shared-types";
import { Badge } from "@workspace/ui/components/badge";
import { TopicDetailContent } from "../_components/topicDetailContent";
import { VoteCounts } from "../_components/voteCounts";
import { TAG_MAP } from "../_constants";

/**
 * 특정 토픽의 상세 정보를 조회합니다.
 * @param id - 토픽 ID
 * @returns 토픽 상세 정보
 */
const getTopic = async (id: string) => {
  const response = await httpClient.get<ApiResponse<PostResponse>>(
    `/api/posts/${id}`
  );
  return response.data;
};

export default async function TopicDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const topic = await getTopic(id);

  return (
    <div className="min-h-screen bg-background">
      <main className="p-4 space-y-3 ">
        {/* 토픽 정보 카드 */}
        <article className="bg-card border rounded-lg p-4 space-y-4 relative">
          <VoteProgressBar
            agreeCount={topic.agreeCount}
            disagreeCount={topic.disagreeCount}
            height="100px"
          />
          {/* 카테고리 */}
          <div>
            <Badge variant={TAG_MAP[topic.tag].variant}>
              {TAG_MAP[topic.tag].name}
            </Badge>
          </div>

          {/* 제목 */}
          <h1 className="text-title-lg font-bold">{topic.title}</h1>

          {/* 작성자 & 작성일 */}
          <div className="flex items-center gap-2 text-caption-default text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {topic.creator.nickname[0]}
              </span>
              <span>{topic.creator.nickname}</span>
            </span>
            <span>·</span>
            <time>{new Date(topic.createdAt).toLocaleDateString()}</time>
            <span>·</span>
            <span>
              {topic.creatorOpinion === "agree"
                ? "찬성"
                : topic.creatorOpinion === "disagree"
                  ? "반대"
                  : "중립"}
            </span>
          </div>

          {/* 내용 */}
          <p className="text-body-default leading-relaxed whitespace-pre-wrap pt-2">
            {topic.content}
          </p>

          {/* 통계 섹션 */}
          <VoteCounts postId={id} />
        </article>

        {/* 투표 및 댓글 섹션 */}
        <TopicDetailContent topicId={id}  />
      </main>
    </div>
  );
}
