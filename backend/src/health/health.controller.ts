import { Controller, Get } from '@nestjs/common';
import { anonymous, type Reply, type Request } from '../http/endpoint.ts';
import { ok, problem } from '../http/problems.ts';
import { Ctx, UsePolicy, WithoutDatabase } from '../http/nest/decorators.ts';

/** Liveness and readiness for the platform's health checks (L2-088); anonymous by explicit choice. */
@Controller('health')
export class HealthController {
  @Get('live')
  @UsePolicy(anonymous)
  @WithoutDatabase()
  async live(): Promise<Reply> {
    return ok({ status: 'live' });
  }

  @Get('ready')
  @UsePolicy(anonymous)
  @WithoutDatabase()
  async ready(@Ctx() req: Request): Promise<Reply> {
    return (await req.env.db.ping()) ? ok({ status: 'ready' }) : problem(503, 'Not ready');
  }
}
