import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { roles, signedIn, type Reply, type Request } from '../http/endpoint.ts';
import { Ctx, UsePolicy } from '../http/nest/decorators.ts';
import { accountView } from './account-view.ts';
import { endSession, listSessions } from './active-sessions.ts';
import { updateDetails } from './details.ts';
import { changePassword } from './password.ts';
import { requestDataExport } from './data-export.ts';
import { deleteAccount } from './deletion.ts';

/** The signed-in person's own account (docs/detailed-designs/privacy, identity-and-security/manage-sessions). */
@Controller()
export class AccountController {
  @Get('api/me/account')
  @UsePolicy(signedIn)
  accountView(@Ctx() req: Request): Promise<Reply> {
    return accountView(req);
  }

  @Put('api/me/details')
  @UsePolicy(signedIn)
  updateDetails(@Ctx() req: Request): Promise<Reply> {
    return updateDetails(req);
  }

  @Post('api/me/password')
  @UsePolicy(signedIn)
  changePassword(@Ctx() req: Request): Promise<Reply> {
    return changePassword(req);
  }

  @Get('api/me/sessions')
  @UsePolicy(signedIn)
  listSessions(@Ctx() req: Request): Promise<Reply> {
    return listSessions(req);
  }

  @Delete('api/me/sessions/:id')
  @UsePolicy(signedIn)
  endSession(@Ctx() req: Request): Promise<Reply> {
    return endSession(req);
  }

  /** Operators' accounts are managed by an Admin (moderation), not exported or deleted here. */
  @Post('api/me/data-exports')
  @UsePolicy(roles('Customer', 'Caterer'))
  requestDataExport(@Ctx() req: Request): Promise<Reply> {
    return requestDataExport(req);
  }

  @Post('api/me/deletion')
  @UsePolicy(roles('Customer', 'Caterer'))
  deleteAccount(@Ctx() req: Request): Promise<Reply> {
    return deleteAccount(req);
  }
}
