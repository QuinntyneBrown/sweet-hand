import { Controller, Get, Post } from '@nestjs/common';
import { anonymous, type Reply, type Request } from '../http/endpoint.ts';
import { Ctx, MaxBody, UsePolicy } from '../http/nest/decorators.ts';
import { confirmLaunchListEmail } from './confirm.ts';
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
}
