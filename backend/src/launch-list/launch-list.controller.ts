import { Controller, Get, Post } from '@nestjs/common';
import { anonymous, type Reply, type Request } from '../http/endpoint.ts';
import { Ctx, MaxBody, UsePolicy, WithoutCsrf } from '../http/nest/decorators.ts';
import { confirmLaunchListEmail } from './confirm.ts';
import { leaveLaunchList, openRemovalLink, unsubscribeOneClick } from './leave.ts';
import { joinLaunchList, launchListStatus } from './sign-up.ts';

/**
 * The launch list (docs/detailed-designs/launch). Every route is anonymous by
 * deliberate choice: visitors join, confirm and leave without an account
 * (L2-104.1). No route returns a record, an address list or a count.
 */
@Controller()
export class LaunchListController {
  @Get('api/public/launch-list')
  @UsePolicy(anonymous)
  status(@Ctx() req: Request): Promise<Reply> {
    return launchListStatus(req);
  }

  @Post('api/launch-list/sign-ups')
  @UsePolicy(anonymous)
  @MaxBody(4096)
  signUp(@Ctx() req: Request): Promise<Reply> {
    return joinLaunchList(req);
  }

  @Post('api/launch-list/confirmations')
  @UsePolicy(anonymous)
  @MaxBody(4096)
  confirm(@Ctx() req: Request): Promise<Reply> {
    return confirmLaunchListEmail(req);
  }

  @Post('api/launch-list/removals')
  @UsePolicy(anonymous)
  @MaxBody(4096)
  remove(@Ctx() req: Request): Promise<Reply> {
    return leaveLaunchList(req);
  }

  /** The removal link in every launch list email; it deletes nothing (link scanners fetch it). */
  @Get('api/launch-list/unsubscribe')
  @UsePolicy(anonymous)
  openRemovalLink(@Ctx() req: Request): Promise<Reply> {
    return openRemovalLink(req);
  }

  /** RFC 8058 one-click unsubscribe: a mail client has no CSRF cookie, so its removal token is its only authority (L2-104.3). */
  @Post('api/launch-list/unsubscribe')
  @UsePolicy(anonymous)
  @MaxBody(1024)
  @WithoutCsrf()
  unsubscribeOneClick(@Ctx() req: Request): Promise<Reply> {
    return unsubscribeOneClick(req);
  }
}
