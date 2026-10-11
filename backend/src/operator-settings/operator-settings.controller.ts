import { Controller, Get, Post } from '@nestjs/common';
import { admins, anonymous, roles, type Reply, type Request } from '../http/router.ts';
import { Ctx, Refusal, UsePolicy } from '../http/nest/decorators.ts';
import { recordVisit } from './visits.ts';
import { listModeratedReviews, moderateReview } from './moderate-reviews.ts';
import { queryAuditLog } from './audit-log.ts';
import { enquiryMetrics, exportMetrics, metricsReport } from './metrics.ts';
import { adminOnly, deactivateOperator, inviteOperator, listOperators } from './accounts.ts';
import { listBreaches, recordBreach } from './breaches.ts';
import { addCuisine, cuisineUsage, listCuisines, retireCuisine } from './cuisines.ts';

const operators = roles('Operator');

/** Operator console settings and metrics (docs/detailed-designs/{discovery,moderation,metrics,privacy}). */
@Controller()
export class OperatorSettingsController {
  @Get('api/operator/cuisines')
  @UsePolicy(operators)
  listCuisines(@Ctx() req: Request): Promise<Reply> {
    return listCuisines(req);
  }

  @Post('api/operator/cuisines')
  @UsePolicy(operators)
  addCuisine(@Ctx() req: Request): Promise<Reply> {
    return addCuisine(req);
  }

  @Get('api/operator/cuisines/:id/usage')
  @UsePolicy(operators)
  cuisineUsage(@Ctx() req: Request): Promise<Reply> {
    return cuisineUsage(req);
  }

  @Post('api/operator/cuisines/:id/retire')
  @UsePolicy(operators)
  retireCuisine(@Ctx() req: Request): Promise<Reply> {
    return retireCuisine(req);
  }

  @Get('api/operator/breaches')
  @UsePolicy(operators)
  listBreaches(@Ctx() req: Request): Promise<Reply> {
    return listBreaches(req);
  }

  @Post('api/operator/breaches')
  @UsePolicy(operators)
  recordBreach(@Ctx() req: Request): Promise<Reply> {
    return recordBreach(req);
  }

  @Get('api/operator/accounts')
  @UsePolicy(admins)
  @Refusal(adminOnly)
  listOperators(@Ctx() req: Request): Promise<Reply> {
    return listOperators(req);
  }

  @Post('api/operator/accounts')
  @UsePolicy(admins)
  @Refusal(adminOnly)
  inviteOperator(@Ctx() req: Request): Promise<Reply> {
    return inviteOperator(req);
  }

  @Post('api/operator/accounts/:id/deactivate')
  @UsePolicy(admins)
  @Refusal(adminOnly)
  deactivateOperator(@Ctx() req: Request): Promise<Reply> {
    return deactivateOperator(req);
  }

  /** Read-only by design: no route edits or deletes an entry (L2-060.2). */
  @Get('api/operator/audit-log')
  @UsePolicy(admins)
  @Refusal(adminOnly)
  queryAuditLog(@Ctx() req: Request): Promise<Reply> {
    return queryAuditLog(req);
  }

  @Get('api/operator/metrics')
  @UsePolicy(operators)
  metricsReport(@Ctx() req: Request): Promise<Reply> {
    return metricsReport(req);
  }

  @Get('api/operator/metrics/enquiries')
  @UsePolicy(operators)
  enquiryMetrics(@Ctx() req: Request): Promise<Reply> {
    return enquiryMetrics(req);
  }

  @Get('api/operator/metrics/export.csv')
  @UsePolicy(operators)
  exportMetrics(@Ctx() req: Request): Promise<Reply> {
    return exportMetrics(req);
  }

  @Get('api/operator/reviews')
  @UsePolicy(operators)
  listModeratedReviews(@Ctx() req: Request): Promise<Reply> {
    return listModeratedReviews(req);
  }

  @Post('api/operator/reviews/:id/:action')
  @UsePolicy(operators)
  moderateReview(@Ctx() req: Request): Promise<Reply> {
    return moderateReview(req);
  }

  /** Anonymous by deliberate choice: visitors who are not signed in are counted, without any id (L2-062). */
  @Post('api/visits')
  @UsePolicy(anonymous)
  recordVisit(@Ctx() req: Request): Promise<Reply> {
    return recordVisit(req);
  }
}
