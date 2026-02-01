import { VoteStatus } from './enums';

export interface VoteResponse {
  id: string;
  postId: string;
  userId: string;
  currentStatus: VoteStatus;
  changeCount: number;
  firstVotedAt: Date;
  lastChangedAt: Date | null;
}

export interface CreateVoteDto {
  postId: string;
  status: VoteStatus;
}
