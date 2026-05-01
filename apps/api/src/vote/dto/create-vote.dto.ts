import { IsIn, IsUUID } from 'class-validator';
import { VoteStatus } from '@chanban/shared-types';

/** 신규 투표에 허용되는 상태: 찬성/반대 (중립은 금지) */
const VOTABLE_STATUSES = [VoteStatus.AGREE, VoteStatus.DISAGREE] as const;

export class CreateVoteDto {
  @IsUUID()
  postId: string;

  @IsIn(VOTABLE_STATUSES as unknown as VoteStatus[])
  status: VoteStatus;
}
