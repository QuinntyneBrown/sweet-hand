import 'reflect-metadata';
import { RequestMethod, type Type } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants.js';
import type { Policy } from '../endpoint.ts';
import { POLICY } from './decorators.ts';

export interface CatalogRoute {
  method: string;
  path: string;
  policy: Policy | undefined;
}

const join = (...parts: (string | undefined)[]) => '/' + parts.flatMap((p) => (p ?? '').split('/')).filter(Boolean).join('/');

/** Every endpoint of the given controllers with its policy (the endpoint policy catalog, authorise-requests design). */
export function routeCatalog(controllers: Type<unknown>[]): CatalogRoute[] {
  const routes: CatalogRoute[] = [];
  for (const controller of controllers) {
    const base = Reflect.getMetadata(PATH_METADATA, controller) as string | undefined;
    for (const name of Object.getOwnPropertyNames(controller.prototype)) {
      const handler = controller.prototype[name];
      if (name === 'constructor' || typeof handler !== 'function') continue;
      const path = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
      if (path === undefined || method === undefined) continue;
      routes.push({ method: RequestMethod[method], path: join(base, path), policy: Reflect.getMetadata(POLICY, handler) });
    }
  }
  return routes;
}
