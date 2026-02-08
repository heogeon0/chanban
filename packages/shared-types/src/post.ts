import { PostTag, VoteStatus } from './enums';

export interface UserResponse {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}

export interface PostResponse {
  id: string;
  creatorId: string;
  creator: UserResponse;
  title: string;
  content: string;
  tag: PostTag;
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
