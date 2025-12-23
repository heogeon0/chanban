
import { httpClient } from "@/lib/httpClient";
import { PaginatedResponse, PostResponse, PostTag, TAGS } from "@chanban/shared-types";
import { Badge } from "@workspace/ui/components/badge";
import Link from "next/link";
import { TopicCard } from "./_components/topicCard";
import { TopicList } from "./_components/topicList";


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

async function getPosts(tag?: PostTag | 'recent' | 'hot') {

  if (tag === 'recent') {
    return await httpClient.get<PaginatedResponse<PostResponse>>(`/api/posts/recent`);
  }

  if (tag === 'hot') {
    return await httpClient.get<PaginatedResponse<PostResponse>>(`/api/posts/recent?sort=popular`);
  }

  return await httpClient.get<PaginatedResponse<PostResponse>>(`/api/posts/tags/${tag}`);
}




export default async function TopicsPage({ searchParams }: { searchParams: Promise<{ tag: string }> }) {
  const { tag } = await searchParams;
  const selectedTag = (TAGS.includes(tag as PostTag) ? tag as PostTag : 'hot') as PostTag | 'recent' | 'hot';
  const initialPosts = await getPosts(selectedTag);

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
          {/* SSR로 렌더링된 첫 페이지 데이터 */}
          {initialPosts.data.map((post) => (
            <li key={post.id}>
              <TopicCard post={post} />
            </li>
          ))}
        </ul>
        {/* 클라이언트 컴포넌트에서 메타정보 기반 무한스크롤 */}
        <TopicList tag={selectedTag} initialMeta={initialPosts.meta} />
      </main>
    </div>
  );
}
