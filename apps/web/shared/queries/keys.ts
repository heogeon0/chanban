import { CommentSortType, PostTag } from "@chanban/shared-types";

/**
 * 쿼리 키 정의
 * 각 도메인별 쿼리 키를 팩토리 함수로 관리합니다.
 */
export const queryKeys = {
  topic: {
    all: ["topics"] as const,
    list: (tag: PostTag | "recent" | "hot") => ["topics", tag] as const,
    infiniteList: (tag: PostTag | "recent" | "hot") =>
      ["topics", "infinite", tag] as const,
    detail: (postId: string) => ["topic", postId] as const,
    search: (q: string, type: string = "all") =>
      ["topics", "search", q, type] as const,
    official: (page: number) => ["topics", "official", page] as const,
    officialInfinite: () => ["topics", "official", "infinite"] as const,
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
  user: {
    myPosts: (page: number) => ["user", "posts", page] as const,
    myVotes: (page: number) => ["user", "votes", page] as const,
    profile: (userId: string) => ["user", "profile", userId] as const,
    posts: (userId: string, page: number) => ["user", "posts", userId, page] as const,
    comments: (userId: string, page: number) => ["user", "comments", userId, page] as const,
  },
  follow: {
    status: (userId: string) => ["follow", "status", userId] as const,
    counts: (userId: string) => ["follow", "counts", userId] as const,
    followers: (userId: string, page: number) => ["follow", "followers", userId, page] as const,
    following: (userId: string, page: number) => ["follow", "following", userId, page] as const,
  },
  summary: {
    get: (postId: string) => ["summary", postId] as const,
  },
};
