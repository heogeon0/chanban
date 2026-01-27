import { httpClient } from "@/lib/httpClient";
import { ApiResponse, PostResponse } from "@chanban/shared-types";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { TopicDetailContent } from "./widgets/topicDetailContent";
import { TAG_MAP } from "../domains/constants";

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

/**
 * 상대적 시간을 계산합니다.
 * @param dateInput - 날짜 문자열 또는 Date 객체
 * @returns 상대적 시간 문자열 (예: "2시간 전")
 */
const getRelativeTime = (dateInput: string | Date): string => {
  const now = new Date();
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}일 전`;

  return date.toLocaleDateString();
};

export default async function TopicDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const topic = await getTopic(id);

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
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {topic.creator.nickname[0]}
            </div>
            <p className="text-muted-foreground text-sm">
              Posted by{" "}
              <span className="text-primary font-medium">
                @{topic.creator.nickname}
              </span>
              <span className="mx-1">•</span>
              <span>{getRelativeTime(topic.createdAt)}</span>
              <span className="mx-1">in</span>
              <span className="font-medium">#{tagInfo.name}</span>
            </p>
          </div>
        </header>

        {/* 본문 */}
        <article className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-lg leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {topic.content}
          </p>
        </article>

        {/* 투표 및 댓글 섹션 */}
        <TopicDetailContent topicId={id} />
      </main>
    </div>
  );
}
