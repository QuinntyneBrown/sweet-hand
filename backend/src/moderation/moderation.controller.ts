import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { roles, type Reply, type Request } from '../http/router.ts';
import { Ctx, UsePolicy } from '../http/nest/decorators.ts';
import { contributeSessionCounters } from '../identity/session-view.ts';
import { queueItems, reviewQueue } from './queue.ts';
import { approveName, approveProfile, declineName, requestChanges } from './decisions.ts';
import { catererRecordView, listCaterersForOperators } from './records.ts';
import { reinstate, remove, suspend } from './status-actions.ts';
import { editProfile, removeDish, removePhoto } from './operator-edits.ts';
import { recentChanges, revertChange } from './recent-changes.ts';
import { openLinkedEnquiry, openReport, resolveReport } from './report-handling.ts';
import { certificateFile, certificateFileLink, profileForReview } from './profile-review.ts';

const operators = roles('Operator');

// The shell shows how many items wait in the review queue.
contributeSessionCounters({ queueCount: async (tx, now) => (await queueItems(tx, now)).length });

/** Operator moderation endpoints (docs/detailed-designs/moderation). Every route checks the operator role (L2-056.3). */
@Controller()
export class ModerationController {
  @Get('api/operator/queue')
  @UsePolicy(operators)
  reviewQueue(@Ctx() req: Request): Promise<Reply> {
    return reviewQueue(req);
  }

  @Get('api/operator/queue/profiles/:id')
  @UsePolicy(operators)
  profileForReview(@Ctx() req: Request): Promise<Reply> {
    return profileForReview(req);
  }

  @Get('api/operator/profiles/:id/certificate-file')
  @UsePolicy(operators)
  certificateFileLink(@Ctx() req: Request): Promise<Reply> {
    return certificateFileLink(req);
  }

  /** The link's token and an operator session are both needed. */
  @Get('api/operator/certificate-files/:token')
  @UsePolicy(operators)
  certificateFile(@Ctx() req: Request): Promise<Reply> {
    return certificateFile(req);
  }

  @Get('api/operator/caterers')
  @UsePolicy(operators)
  listCaterersForOperators(@Ctx() req: Request): Promise<Reply> {
    return listCaterersForOperators(req);
  }

  @Get('api/operator/caterers/:id')
  @UsePolicy(operators)
  catererRecordView(@Ctx() req: Request): Promise<Reply> {
    return catererRecordView(req);
  }

  @Post('api/operator/profiles/:id/approve')
  @UsePolicy(operators)
  approveProfile(@Ctx() req: Request): Promise<Reply> {
    return approveProfile(req);
  }

  @Post('api/operator/profiles/:id/request-changes')
  @UsePolicy(operators)
  requestChanges(@Ctx() req: Request): Promise<Reply> {
    return requestChanges(req);
  }

  @Post('api/operator/profiles/:id/suspend')
  @UsePolicy(operators)
  suspend(@Ctx() req: Request): Promise<Reply> {
    return suspend(req);
  }

  @Post('api/operator/profiles/:id/reinstate')
  @UsePolicy(operators)
  reinstate(@Ctx() req: Request): Promise<Reply> {
    return reinstate(req);
  }

  @Post('api/operator/profiles/:id/remove')
  @UsePolicy(operators)
  remove(@Ctx() req: Request): Promise<Reply> {
    return remove(req);
  }

  @Patch('api/operator/profiles/:id')
  @UsePolicy(operators)
  editProfile(@Ctx() req: Request): Promise<Reply> {
    return editProfile(req);
  }

  @Delete('api/operator/profiles/:id/photos/:item')
  @UsePolicy(operators)
  removePhoto(@Ctx() req: Request): Promise<Reply> {
    return removePhoto(req);
  }

  @Delete('api/operator/profiles/:id/menu-items/:item')
  @UsePolicy(operators)
  removeDish(@Ctx() req: Request): Promise<Reply> {
    return removeDish(req);
  }

  @Get('api/operator/recent-changes')
  @UsePolicy(operators)
  recentChanges(@Ctx() req: Request): Promise<Reply> {
    return recentChanges(req);
  }

  @Post('api/operator/recent-changes/:id/revert')
  @UsePolicy(operators)
  revertChange(@Ctx() req: Request): Promise<Reply> {
    return revertChange(req);
  }

  @Get('api/operator/reports/:id')
  @UsePolicy(operators)
  openReport(@Ctx() req: Request): Promise<Reply> {
    return openReport(req);
  }

  @Post('api/operator/reports/:id/resolve')
  @UsePolicy(operators)
  resolveReport(@Ctx() req: Request): Promise<Reply> {
    return resolveReport(req);
  }

  @Post('api/operator/reports/:id/enquiry')
  @UsePolicy(operators)
  openLinkedEnquiry(@Ctx() req: Request): Promise<Reply> {
    return openLinkedEnquiry(req);
  }

  @Post('api/operator/profiles/:id/name/approve')
  @UsePolicy(operators)
  approveName(@Ctx() req: Request): Promise<Reply> {
    return approveName(req);
  }

  @Post('api/operator/profiles/:id/name/request-changes')
  @UsePolicy(operators)
  declineName(@Ctx() req: Request): Promise<Reply> {
    return declineName(req);
  }
}
