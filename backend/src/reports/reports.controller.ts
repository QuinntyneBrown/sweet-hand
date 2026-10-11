import { Controller, Post } from '@nestjs/common';
import { anonymous, type Reply, type Request } from '../http/router.ts';
import { Ctx, UsePolicy } from '../http/nest/decorators.ts';
import { submitReport } from './submit.ts';

/** Reports endpoints (docs/detailed-designs/moderation/report-content). */
@Controller()
export class ReportsController {
  /** Anonymous by explicit choice (L2-054): anyone may report; visitors pass the bot challenge and the hourly limit. */
  @Post('api/reports')
  @UsePolicy(anonymous)
  submitReport(@Ctx() req: Request): Promise<Reply> {
    return submitReport(req);
  }
}
