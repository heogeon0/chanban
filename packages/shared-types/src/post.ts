import { PostTag, UserRole, VoteStatus } from './enums';

export interface UserResponse {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  role?: UserRole;
}

export interface PostResponse {
  id: string;
  creatorId: string;
  creator: UserResponse;
  title: string;
  content: string;
  tag: PostTag;
  isOfficial: boolean;
  showCreatorOpinion: boolean;
  creatorVote?: VoteStatus | null;
  agreeCount: number;
  disagreeCount: number;
  neutralCount: number;
  commentCount: number;
  viewCount: number;
  popularityScore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VoteCountResponse {
  agreeCount: number;
  disagreeCount: number;
  neutralCount: number;
}

/**
 * 메인 피드 RSC + Client Island 구조에서 client가 fresh fetch하는 동적 카운트 묶음.
 * RSC는 정적 콘텐츠만 캐싱하고, 카드의 모든 카운트는 이 응답으로 갱신한다.
 */
export interface PostStatsResponse {
  agreeCount: number;
  disagreeCount: number;
  neutralCount: number;
  commentCount: number;
  viewCount: number;
}
