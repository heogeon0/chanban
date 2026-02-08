import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  upsertVote(@Body() createVoteDto: CreateVoteDto, @CurrentUser() user: User) {
    return this.voteService.upsertVote(createVoteDto, user.id);
  }

  @Get('posts/:postId/me')
  getMyVote(@Param('postId') postId: string, @CurrentUser() user: User) {
    return this.voteService.getMyVote(postId, user.id);
  }
}
