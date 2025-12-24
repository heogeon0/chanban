import { httpClient } from "@/lib/httpClient";
import { BanIcon, ChanIcon, ChongIcon } from "@/shared/ui/icons";
import { VoteProgressBar } from "@/shared/ui/voteProgressBar";
import { ApiResponse, PostResponse } from "@chanban/shared-types";
import { Badge } from "@workspace/ui/components/badge";
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
          <section className="space-y-3">
            <h4 className="text-title-default">
              총{" "}
              {topic.agreeCount +
                topic.disagreeCount +
                (topic.neutralCount || 0)}
              명 참여
            </h4>
            {/* 동의/반대/중립 통계 카드 */}
            <div className="bg-card border rounded-lg p-4 relative">
              <VoteProgressBar
                agreeCount={topic.agreeCount}
                disagreeCount={topic.disagreeCount}
                height="100%"
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <ChanIcon size={32} className="text-opinion-agree" />

                  <div className="flex flex-col">
                    <span className="text-caption-default text-muted-foreground">
                      찬성
                    </span>
                    <span className="text-title-default font-semibold">
                      {topic.agreeCount}
                    </span>
                  </div>
                </div>

                <div className="w-px h-12 bg-border" />

                <div className="flex items-center gap-3">
                  <ChongIcon size={32} className="text-opinion-neutral" />
                  <div className="flex flex-col">
                    <span className="text-caption-default text-muted-foreground">
                      중립
                    </span>
                    <span className="text-title-default font-semibold">
                      {topic.neutralCount || 0}
                    </span>
                  </div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="flex items-center gap-3">
                  <BanIcon size={32} className="text-opinion-disagree" />
                  <div className="flex flex-col">
                    <span className="text-caption-default text-muted-foreground">
                      반대
                    </span>
                    <span className="text-title-default font-semibold">
                      {topic.disagreeCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </article>

        {/* 댓글 섹션 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-title-default font-semibold">
              댓글 {topic.commentCount}개
            </h2>
          </div>

          {/* TODO: 댓글 목록은 별도 컴포넌트나 API로 구현 필요 */}
          {topic.commentCount === 0 ? (
            <div className="bg-card border rounded-lg p-8 text-center text-muted-foreground">
              아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
            </div>
          ) : (
            <div className="bg-card border rounded-lg p-4 text-center text-muted-foreground">
              댓글 {topic.commentCount}개
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
