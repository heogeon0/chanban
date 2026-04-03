import { httpClient } from "@/lib/httpClient";
import {
  ApiResponse,
  PaginatedResponse,
  PostResponse,
  PostTag,
  VoteStatus,
} from "@chanban/shared-types";
import { queryKeys } from "./keys";

export interface PostSummaryResponse {
  id: string;
  postId: string;
  contentSummary: string | null;
  voteSummary: string | null;
  agreeSummary: string | null;
  disagreeSummary: string | null;
  commentCountAtGeneration: number;
  generatedAt: string;
}

/**
 * 토픽 관련 쿼리 옵션
 * queryKey와 queryFn을 함께 관리합니다.
 */
export const summaryQueries = {
  /**
   * 게시물 AI 요약 조회
   * @param postId - 게시물 ID
   */
  get: (postId: string) => ({
    queryKey: queryKeys.summary.get(postId),
    queryFn: async () => {
      return await httpClient
        .get<ApiResponse<PostSummaryResponse>>(`/api/posts/${postId}/summary`)
        .then((res) => res.data);
    },
  }),
};

export const topicQueries = {
  /**
   * 토픽 목록 조회 쿼리 옵션
   * @param tag - 조회할 태그 (PostTag, 'recent', 'hot')
   * @param page - 페이지 번호
   */
  list: (tag: PostTag | "recent" | "hot", page: number) => ({
    queryKey: queryKeys.topic.list(tag),
    queryFn: async () => {
      let url: string;

      if (tag === "recent") {
        url = `/api/posts/recent?page=${page}`;
      } else if (tag === "hot") {
        url = `/api/posts/recent?sort=popular&page=${page}`;
      } else {
        url = `/api/posts/tags/${tag}?page=${page}`;
      }

      return await httpClient.get<PaginatedResponse<PostResponse>>(url);
    },
  }),

  /**
   * 토픽 상세 조회 쿼리 옵션
   * @param postId - 게시물 ID
   */
  detail: (postId: string) => ({
    queryKey: queryKeys.topic.detail(postId),
    queryFn: async () => {
      return await httpClient
        .get<ApiResponse<PostResponse>>(`/api/posts/${postId}`)
        .then((response) => response.data);
    },
  }),
};

/**
 * 토픽 관련 뮤테이션 함수
 */
export const topicMutations = {
  /**
   * 토픽 생성 API 호출
   */
  create: async (createPostDto: CreatePostDto) => {
    return await httpClient.post<ApiResponse<PostCreateResponse>, CreatePostDto>(
      "/api/posts/create",
      createPostDto
    );
  },
};

// Types
export interface CreatePostDto {
  title: string;
  content: string;
  tag: PostTag;
  showCreatorOpinion?: boolean;
  creatorOpinion?: VoteStatus;
}

export interface PostCreateResponse {
  id: string;
  title: string;
  content: string;
  tag: PostTag;
  showCreatorOpinion: boolean;
  createdAt: Date;
}
