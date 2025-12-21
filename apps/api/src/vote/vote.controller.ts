import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('votes')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  upsertVote(@Body() createVoteDto: CreateVoteDto) {
    return this.voteService.upsertVote(createVoteDto);
  }

  @Get('posts/:postId/me')
  getMyVote(@Param('postId') postId: string) {
    return this.voteService.getMyVote(postId);
  }
}
