import { IsEnum, IsUUID } from 'class-validator';
import { VoteStatus } from '@chanban/shared-types';

export class CreateVoteDto {
  @IsUUID()
  postId: string;

  @IsEnum(VoteStatus)
  status: VoteStatus;
}
