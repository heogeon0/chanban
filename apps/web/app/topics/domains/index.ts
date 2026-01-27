

import { httpClient } from "@/lib/httpClient";
import { PaginatedResponse, PostResponse, PostTag, TAGS } from "@chanban/shared-types";


/** 정렬 타입 */
type SortType = "latest" | "popular";


/**
 * searchParams에서 tag와 sortType을 파싱합니다.
 * @param searchParams - URL search params 객체
 * @returns 파싱된 tag와 sortType
 */
function parseSortSearchParams(searchParams: {
  tag?: PostTag | "all";
  sort?: string;
}): { tag: PostTag | "all"; sortType: SortType } {
  const { tag, sort } = searchParams;
  const selectedTag = TAGS.includes(tag as PostTag)
    ? (tag as PostTag)
    : "all";
  const selectedSort: SortType =
    sort === "latest" ? "latest" : "popular";

  return { tag: selectedTag, sortType: selectedSort };
}



/**
 * 게시글 목록을 조회합니다.
 * @param tag - 필터링할 태그 (선택)
 * @param sort - 정렬 방식 (latest/popular)
 */
async function getPosts(tag?: PostTag | "all", sort: SortType = "popular") {
  if (tag === "all" || !tag) {
    const sortParam = sort === "popular" ? "?sort=popular" : "";
    return await httpClient.get<PaginatedResponse<PostResponse>>(
      `/api/posts/recent${sortParam}`
    );
  }

  return await httpClient.get<PaginatedResponse<PostResponse>>(
    `/api/posts/tags/${tag}`
  );
}


export const topicDomains = {
  parseSortSearchParams,
  getPosts,
}