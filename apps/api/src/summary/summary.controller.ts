import { Controller, Get, Logger, NotFoundException, Param } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('posts/:postId/summary')
export class SummaryController {
  private readonly logger = new Logger(SummaryController.name);

  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  async getSummary(@Param('postId') postId: string) {
    try {
      const summary = await this.summaryService.getSummary(postId);

      if (!summary) {
        throw new NotFoundException();
      }

      return summary;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(`Unexpected error fetching summary for post ${postId}`, err);
      throw new NotFoundException();
    }
  }
}
