import { httpClient } from "@/lib/httpClient";
import { VoteBadge } from "@/shared/ui/voteBadge";
import { ApiResponse, PostResponse } from "@chanban/shared-types";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { TAG_MAP } from "../domains/constants";
import { formatRelativeTime } from "./widgets/commentUtils";
import { TopicDetailContent } from "./widgets/topicDetailContent";
import { FollowButton } from "@/shared/components/follow-button";
import { ImageGallery } from "@/shared/components/imageGallery/imageGallery";

/**
 * 특정 토픽의 상세 정보를 조회합니다.
 * cache()로 감싸 generateMetadata와 page 컴포넌트 간 중복 호출을 방지합니다.
 * @param id - 토픽 ID
 * @returns 토픽 상세 정보 또는 null (실패 시)
 */
const getTopic = cache(async (id: string): Promise<PostResponse | null> => {
  try {
    const response = await httpClient.get<ApiResponse<PostResponse>>(
      `/api/posts/${id}`,
      { cache: "force-cache" }
    );
    return response.data;
  } catch {
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return { title: "토픽을 찾을 수 없습니다" };
  }

  const description = topic.content.slice(0, 120).replace(/\n/g, " ");
  const baseUrl = process.env.NEXT_PUBLIC_HOST ?? "";
  const url = `${baseUrl}/topics/${id}`;

  return {
    title: topic.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${topic.title} | 찬반`,
      description,
      type: "article",
      url,
      publishedTime: new Date(topic.createdAt).toISOString(),
      authors: [`@${topic.creator.nickname}`],
    },
  };
}

export default async function TopicDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const topic = await getTopic(id);

  if (!topic) {
    notFound();
  }

  const tagInfo = TAG_MAP[topic.tag] || { name: topic.tag };
  const baseUrl = process.env.NEXT_PUBLIC_HOST ?? "";
  const totalVotes = topic.agreeCount + topic.disagreeCount + topic.neutralCount;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: topic.title,
    text: topic.content,
    datePublished: new Date(topic.createdAt).toISOString(),
    url: `${baseUrl}/topics/${topic.id}`,
    author: {
      "@type": "Person",
      name: `@${topic.creator.nickname}`,
    },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: topic.commentCount,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/VoteAction",
        userInteractionCount: totalVotes,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 포스트 헤더 */}
      <div className="px-5 pt-4 pb-3">
        {/* 카테고리 뱃지 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {tagInfo.name}
          </span>
          {topic.showCreatorOpinion && topic.creatorVote && (
            <VoteBadge status={topic.creatorVote} />
          )}
        </div>

        {/* 제목 */}
        <h1 className="text-[20px] font-bold leading-tight mb-3">
          {topic.title}
        </h1>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {topic.creator.nickname.charAt(0)}
          </div>
          <Link href={`/users/${topic.creator.id}`} className="text-[13px] font-medium hover:underline">
            {topic.creator.nickname}
          </Link>
          <span className="text-[12px] text-muted-foreground">{formatRelativeTime(topic.createdAt)}</span>
          <FollowButton userId={topic.creator.id} />
        </div>

        {/* 본문 */}
        {topic.content && (
          <p className="text-[14px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {topic.content}
          </p>
        )}

        {/* 본문 이미지 */}
        {topic.images && topic.images.length > 0 && (
          <ImageGallery images={topic.images} className="mt-3" />
        )}
      </div>

      {/* 구분선 */}
      <div className="h-[1px] mx-5 bg-border" />

      {/* 투표 및 댓글 섹션 */}
      <TopicDetailContent
        topicId={id}
        commentCount={topic.commentCount}
        initialVoteCount={{
          agreeCount: topic.agreeCount,
          disagreeCount: topic.disagreeCount,
          neutralCount: topic.neutralCount,
        }}
      />
    </div>
  );
}
