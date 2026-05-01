import { topicDomains } from "../topics/domains";
import { OfficialFeedList } from "./officialFeedList";

/**
 * 공식 투표 피드 RSC — 초기 1페이지 서버 fetch 후 클라이언트 리스트로 전달
 */
export async function OfficialFeedContent() {
  const initial = await topicDomains.getOfficialPosts(1, 10);
  return <OfficialFeedList initialData={initial} />;
}
