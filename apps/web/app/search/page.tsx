import { topicDomains } from "@/app/topics/domains";
import { SearchContent } from "./widgets/searchContent";

/**
 * 탐색 페이지 (RSC)
 * 인기 토픽 초기 데이터를 서버에서 fetch해서 SearchContent에 전달
 */
export default async function SearchPage() {
  const hotPosts = await topicDomains.getAllPosts();

  return <SearchContent hotPosts={hotPosts.data} />;
}
