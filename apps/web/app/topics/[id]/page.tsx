import { httpClient } from "@/lib/httpClient";
import { UserAvatar } from "@/shared/ui/avatar";
import { VoteBadge } from "@/shared/ui/voteBadge";
import { ApiResponse, PostResponse } from "@chanban/shared-types";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { TAG_MAP } from "../domains/constants";
import { formatRelativeTime } from "./widgets/commentUtils";
import { TopicDetailContent } from "./widgets/topicDetailContent";

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
      <div className="max-w-[840px] mx-auto px-6 py-8">
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
    </div>
  );
}
