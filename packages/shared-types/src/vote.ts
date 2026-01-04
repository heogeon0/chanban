import { VoteStatus } from './enums';

export interface VoteResponse {
  id: string;
  postId: string;
  userId: string;
  status: VoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVoteDto {
  postId: string;
  status: VoteStatus;
}
