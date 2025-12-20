import { VoteStatus } from './enums';

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
  };
  postId: string;
  voteHistory: VoteHistoryResponse[];
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
  };
  postId: string;
  parentId: string | null;
  replies: CommentReplyResponse[];
  totalReplies: number;
  voteHistory: VoteHistoryResponse[];
}
