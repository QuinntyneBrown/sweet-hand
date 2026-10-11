import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { anonymous, roles, signedIn, type Reply, type Request } from '../http/router.ts';
import { Ctx, UsePolicy } from '../http/nest/decorators.ts';
import { listPublicReviews } from './public-reviews.ts';
import { reviewEligibility } from './eligibility.ts';
import { writeReview } from './write.ts';
import { deleteReview, editReview } from './own-review.ts';
import { deleteResponse, editResponse, listOwnReviews, postResponse } from './respond.ts';

/** Reviews endpoints (docs/detailed-designs/reviews). */
@Controller()
export class ReviewsController {
  /** Anonymous by explicit choice: published reviews are part of public browsing (L2-013). */
  @Get('api/public/caterers/:slug/reviews')
  @UsePolicy(anonymous)
  listPublicReviews(@Ctx() req: Request): Promise<Reply> {
    return listPublicReviews(req);
  }

  /** Any signed-in caller may ask; only customers are ever eligible (L2-049.5). */
  @Get('api/me/caterers/:slug/review-eligibility')
  @UsePolicy(signedIn)
  reviewEligibility(@Ctx() req: Request): Promise<Reply> {
    return reviewEligibility(req);
  }

  /** Caterers and operators never review (L2-049.5). */
  @Post('api/me/caterers/:slug/reviews')
  @UsePolicy(roles('Customer'))
  writeReview(@Ctx() req: Request): Promise<Reply> {
    return writeReview(req);
  }

  @Put('api/me/reviews/:id')
  @UsePolicy(roles('Customer'))
  editReview(@Ctx() req: Request): Promise<Reply> {
    return editReview(req);
  }

  @Delete('api/me/reviews/:id')
  @UsePolicy(roles('Customer'))
  deleteReview(@Ctx() req: Request): Promise<Reply> {
    return deleteReview(req);
  }

  /** The caterer's own reviews and public responses (respond-to-review design). */
  @Get('api/caterer/reviews')
  @UsePolicy(roles('Caterer'))
  listOwnReviews(@Ctx() req: Request): Promise<Reply> {
    return listOwnReviews(req);
  }

  @Post('api/caterer/reviews/:id/response')
  @UsePolicy(roles('Caterer'))
  postResponse(@Ctx() req: Request): Promise<Reply> {
    return postResponse(req);
  }

  @Put('api/caterer/reviews/:id/response')
  @UsePolicy(roles('Caterer'))
  editResponse(@Ctx() req: Request): Promise<Reply> {
    return editResponse(req);
  }

  @Delete('api/caterer/reviews/:id/response')
  @UsePolicy(roles('Caterer'))
  deleteResponse(@Ctx() req: Request): Promise<Reply> {
    return deleteResponse(req);
  }
}
