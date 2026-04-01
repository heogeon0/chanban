import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('posts/:postId/summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  async getSummary(@Param('postId') postId: string) {
    const summary = await this.summaryService.getSummary(postId);

    if (!summary) {
      throw new NotFoundException();
    }

    return summary;
  }
}
