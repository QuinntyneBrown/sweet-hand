import { Controller, Get, Post, Put } from '@nestjs/common';
import { roles, signedIn, type Reply, type Request } from '../http/router.ts';
import { Ctx, UsePolicy } from '../http/nest/decorators.ts';
import { sendEnquiry } from './send.ts';
import { getDraft, saveDraft } from './drafts.ts';
import { contributeSessionCounters } from '../identity/session-view.ts';
import { browseInbox } from './inbox.ts';
import { closeEnquiry, declineEnquiry, openThread, postReply, shareContact } from './thread.ts';
import { unreadThreads } from './rules.ts';

// The header badge counts threads with something unread (L2-029.1).
contributeSessionCounters({ unread: unreadThreads });

const parties = roles('Customer', 'Caterer');

/** Enquiry endpoints (docs/detailed-designs/enquiries). Only the two parties of an enquiry see it (L2-034). */
@Controller()
export class EnquiriesController {
  @Get('api/enquiries')
  @UsePolicy(parties)
  browseInbox(@Ctx() req: Request): Promise<Reply> {
    return browseInbox(req);
  }

  /** Any signed-in role, so other roles hear "customer accounts only" in the form's words (L2-023.4). */
  @Post('api/enquiries')
  @UsePolicy(signedIn)
  sendEnquiry(@Ctx() req: Request): Promise<Reply> {
    return sendEnquiry(req);
  }

  @Get('api/enquiries/drafts/:caterer')
  @UsePolicy(roles('Customer'))
  getDraft(@Ctx() req: Request): Promise<Reply> {
    return getDraft(req);
  }

  @Put('api/enquiries/drafts/:caterer')
  @UsePolicy(roles('Customer'))
  saveDraft(@Ctx() req: Request): Promise<Reply> {
    return saveDraft(req);
  }

  @Get('api/enquiries/:id')
  @UsePolicy(parties)
  openThread(@Ctx() req: Request): Promise<Reply> {
    return openThread(req);
  }

  @Post('api/enquiries/:id/messages')
  @UsePolicy(parties)
  postReply(@Ctx() req: Request): Promise<Reply> {
    return postReply(req);
  }

  @Post('api/enquiries/:id/decline')
  @UsePolicy(parties)
  declineEnquiry(@Ctx() req: Request): Promise<Reply> {
    return declineEnquiry(req);
  }

  @Post('api/enquiries/:id/close')
  @UsePolicy(parties)
  closeEnquiry(@Ctx() req: Request): Promise<Reply> {
    return closeEnquiry(req);
  }

  @Post('api/enquiries/:id/contact-shares')
  @UsePolicy(parties)
  shareContact(@Ctx() req: Request): Promise<Reply> {
    return shareContact(req);
  }
}
