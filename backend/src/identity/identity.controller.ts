import { Controller, Get, Post } from '@nestjs/common';
import { anonymous, signedIn, type Reply, type Request } from '../http/endpoint.ts';
import { Ctx, UsePolicy } from '../http/nest/decorators.ts';
import { acceptPrivacyNotice, privacyNotice } from './consent.ts';
import { sessionView } from './session-view.ts';
import { signIn, signOut } from './sign-in.ts';
import { completeSecondFactor } from './second-factor.ts';
import { registerCaterer, registerCustomer } from './registration.ts';
import { resendVerification, verifyEmail } from './verification.ts';
import { openResetLink, requestPasswordReset, resetPassword } from './password-reset.ts';

/** Identity endpoints (docs/detailed-designs/identity-and-security). */
@Controller()
export class IdentityController {
  /** Anonymous by choice: visitors learn they are not signed in. */
  @Get('api/session')
  @UsePolicy(anonymous)
  sessionView(@Ctx() req: Request): Promise<Reply> {
    return sessionView(req);
  }

  @Post('api/identity/sign-in')
  @UsePolicy(anonymous)
  signIn(@Ctx() req: Request): Promise<Reply> {
    return signIn(req);
  }

  @Post('api/identity/sign-out')
  @UsePolicy(anonymous)
  signOut(@Ctx() req: Request): Promise<Reply> {
    return signOut(req);
  }

  /** Anonymous by choice: the caller holds a session that is still waiting for this step. */
  @Post('api/identity/second-factor')
  @UsePolicy(anonymous)
  completeSecondFactor(@Ctx() req: Request): Promise<Reply> {
    return completeSecondFactor(req);
  }

  @Post('api/identity/registrations')
  @UsePolicy(anonymous)
  registerCustomer(@Ctx() req: Request): Promise<Reply> {
    return registerCustomer(req);
  }

  @Post('api/identity/registrations/caterer')
  @UsePolicy(anonymous)
  registerCaterer(@Ctx() req: Request): Promise<Reply> {
    return registerCaterer(req);
  }

  /** Links from emails work without a session, by design. */
  @Post('api/identity/email-verifications')
  @UsePolicy(anonymous)
  verifyEmail(@Ctx() req: Request): Promise<Reply> {
    return verifyEmail(req);
  }

  @Post('api/identity/email-verifications/resend')
  @UsePolicy(anonymous)
  resendVerification(@Ctx() req: Request): Promise<Reply> {
    return resendVerification(req);
  }

  @Post('api/identity/password-reset-requests')
  @UsePolicy(anonymous)
  requestPasswordReset(@Ctx() req: Request): Promise<Reply> {
    return requestPasswordReset(req);
  }

  @Get('api/identity/password-resets/:token')
  @UsePolicy(anonymous)
  openResetLink(@Ctx() req: Request): Promise<Reply> {
    return openResetLink(req);
  }

  @Post('api/identity/password-resets')
  @UsePolicy(anonymous)
  resetPassword(@Ctx() req: Request): Promise<Reply> {
    return resetPassword(req);
  }

  /** Public by deliberate choice: anyone may read the privacy notice. */
  @Get('api/public/privacy-notice')
  @UsePolicy(anonymous)
  privacyNotice(@Ctx() req: Request): Promise<Reply> {
    return privacyNotice(req);
  }

  @Post('api/me/consents')
  @UsePolicy(signedIn)
  acceptPrivacyNotice(@Ctx() req: Request): Promise<Reply> {
    return acceptPrivacyNotice(req);
  }
}
