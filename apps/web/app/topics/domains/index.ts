

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
  const { tag } = searchParams;
  const selectedTag = TAGS.includes(tag as PostTag)
    ? (tag as PostTag)
    : "all";

  // 전체 탭은 항상 인기순, 카테고리 탭은 항상 최신순
  const sortType: SortType = selectedTag === "all" ? "popular" : "latest";

  return { tag: selectedTag, sortType };
}



/**
 * 전체 게시글 목록을 조회합니다. (인기순 고정)
 */
async function getAllPosts() {
  return await httpClient.get<PaginatedResponse<PostResponse>>(
    `/api/posts/recent?sort=popular`
  );
}

/**
 * 태그별 최신 게시글 목록을 조회합니다.
 * @param tag - 필터링할 태그
 */
async function getLatestPostsByTag(tag: PostTag) {
  return await httpClient.get<PaginatedResponse<PostResponse>>(
    `/api/posts/tags/${tag}`
  );
}

/**
 * 태그별 인기 게시글을 조회합니다.
 * @param tag - 필터링할 태그
 * @param limit - 가져올 개수 (기본 3)
 */
async function getHotPostsByTag(tag: PostTag, limit = 3) {
  return await httpClient.get<PaginatedResponse<PostResponse>>(
    `/api/posts/tags/${tag}?sort=popular&limit=${limit}`
  );
}


type SearchType = 'all' | 'content' | 'author';

/**
 * 텍스트 검색 — GET /api/posts/search
 * @param q - 검색 키워드 (1~200자)
 * @param type - 검색 범위 ('all' | 'content' | 'author'), 기본 'all'
 * @param page - 페이지 번호, 기본 1
 */
async function searchPosts(q: string, type: SearchType = 'all', page = 1) {
  const params = new URLSearchParams({ q, type, page: String(page) });
  return await httpClient.get<PaginatedResponse<PostResponse>>(
    `/api/posts/search?${params.toString()}`
  );
}

export const topicDomains = {
  parseSortSearchParams,
  getAllPosts,
  getLatestPostsByTag,
  getHotPostsByTag,
  searchPosts,
}