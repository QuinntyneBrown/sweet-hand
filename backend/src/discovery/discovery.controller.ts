import { Controller, Get } from '@nestjs/common';
import { anonymous, type Reply, type Request } from '../http/router.ts';
import { Ctx, UsePolicy } from '../http/nest/decorators.ts';
import { activeCuisines, forwardSortationArea, occasions, serviceAreas } from './taxonomy-views.ts';
import { listCaterers } from './listing.ts';
import { catererPage } from './caterer-page.ts';
import { listNotices } from './notices.ts';
import { media } from './media.ts';

/** Public browsing, anonymous by explicit choice (L2-013). */
@Controller()
export class DiscoveryController {
  @Get('api/public/caterers')
  @UsePolicy(anonymous)
  list(@Ctx() req: Request): Promise<Reply> {
    return listCaterers(req);
  }

  @Get('api/public/caterers/:slug')
  @UsePolicy(anonymous)
  page(@Ctx() req: Request): Promise<Reply> {
    return catererPage(req);
  }

  @Get('api/public/service-areas')
  @UsePolicy(anonymous)
  serviceAreas(): Promise<Reply> {
    return serviceAreas();
  }

  @Get('api/public/occasions')
  @UsePolicy(anonymous)
  occasions(@Ctx() req: Request): Promise<Reply> {
    return occasions(req);
  }

  @Get('api/public/cuisines')
  @UsePolicy(anonymous)
  cuisines(@Ctx() req: Request): Promise<Reply> {
    return activeCuisines(req);
  }

  @Get('api/public/fsa/:fsa')
  @UsePolicy(anonymous)
  fsa(@Ctx() req: Request): Promise<Reply> {
    return forwardSortationArea(req);
  }

  @Get('api/public/notices')
  @UsePolicy(anonymous)
  notices(@Ctx() req: Request): Promise<Reply> {
    return listNotices(req);
  }

  /** Public photos: the caterer pages show them to everyone. */
  @Get('media/:id')
  @UsePolicy(anonymous)
  media(@Ctx() req: Request): Promise<Reply> {
    return media(req);
  }
}
