import { VoteStatus } from './enums';

export type CommentSortType = 'popular' | 'latest';

export interface UserCommentResponse {
  id: string;
  content: string;
  likeCount: number;
  createdAt: Date;
  myVote: VoteStatus | null;
  post: {
    id: string;
    title: string;
  };
}

export interface VoteHistoryResponse {
  fromStatus: VoteStatus | null;
  toStatus: VoteStatus;
  changedAt: Date;
}

export interface CommentReplyResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: {
    id: string;
    nickname: string;
    voteHistory: VoteHistoryResponse[];
  };
  postId: string;
  isLiked: boolean;
  likeCount: number;
}

export interface CommentResponse {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: {
    id: string;
    nickname: string;
    voteHistory: VoteHistoryResponse[];
  };
  postId: string;
  parentId: string | null;
  replies: CommentReplyResponse[];
  totalReplies: number;
  isLiked: boolean;
  likeCount: number;
}
