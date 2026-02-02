import { CommentSortType, PostTag } from "@chanban/shared-types";

/**
 * 쿼리 키 정의
 * 각 도메인별 쿼리 키를 팩토리 함수로 관리합니다.
 */
export const queryKeys = {
  topic: {
    all: ["topics"] as const,
    list: (tag: PostTag | "recent" | "hot") => ["topics", tag] as const,
    detail: (postId: string) => ["topic", postId] as const,
  },
  comment: {
    all: ["comments"] as const,
    list: (postId: string, sort: CommentSortType = "popular") =>
      ["comments", postId, sort] as const,
    replies: (commentId: string, page: number) => ["replies", commentId, page] as const,
  },
  vote: {
    count: (postId: string) => ["voteCount", postId] as const,
    my: (postId: string) => ["myVote", postId] as const,
  },
};
