export { VoteBadge as VoteHistoryBadge } from "@/shared/ui/voteBadge";

/**
 * 날짜를 상대적인 시간 형식으로 포맷팅합니다.
 * 예: "방금 전", "5분 전", "2시간 전", "3일 전"
 *
 * @param date - 포맷팅할 날짜
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return new Date(date).toLocaleDateString("ko-KR");
}
