import { httpClient } from "@/lib/httpClient";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  PostResponse,
  PostTag,
  VoteStatus,
} from "@chanban/shared-types";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "./keys";

interface CreatePostDto {
  title: string;
  content: string;
  tag: PostTag;
  showCreatorOpinion?: boolean;
  creatorOpinion?: VoteStatus;
}

interface PostCreateResponse {
  id: string;
  title: string;
  content: string;
  tag: PostTag;
  showCreatorOpinion: boolean;
  creatorOpinion: VoteStatus | null;
  createdAt: Date;
}

/**
 * 글 작성 mutation 훅
 * 토픽을 생성하고 성공 시 해당 토픽 상세 페이지로 이동합니다.
 */
export function useCreatePost() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (createPostDto: CreatePostDto) => {
      return await httpClient.post<ApiResponse<PostCreateResponse>, CreatePostDto>(
        "/api/posts/create",
        createPostDto
      );
    },
    onSuccess: (data) => {
      router.push(`/topics/${data.data.id}`);
    },
  });
}

/**
 * 무한스크롤을 위한 토픽 목록 조회 훅
 * 초기 데이터의 메타정보를 기반으로 다음 페이지부터 fetch
 *
 * @param tag - 조회할 태그 (PostTag, 'recent', 'hot')
 * @param initialMeta - 서버에서 받아온 초기 데이터의 메타정보
 */
export function useGetInfiniteTopics(
  tag: PostTag | "recent" | "hot",
  initialMeta: PaginationMeta
) {
  const initialHasNextPage = initialMeta.page < initialMeta.totalPages;
  const nextPage = initialMeta.page + 1;

  const query = useInfiniteQuery({
    queryKey: queryKeys.topic.list(tag),
    queryFn: async ({ pageParam }) => {
      let url: string;

      if (tag === "recent") {
        url = `/api/posts/recent?page=${pageParam}`;
      } else if (tag === "hot") {
        url = `/api/posts/recent?sort=popular&page=${pageParam}`;
      } else {
        url = `/api/posts/tags/${tag}?page=${pageParam}`;
      }

      return await httpClient.get<PaginatedResponse<PostResponse>>(url);
    },
    initialPageParam: nextPage,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: false,
  });

  return {
    ...query,
    hasNextPage: query.data ? query.hasNextPage : initialHasNextPage,
  };
}
