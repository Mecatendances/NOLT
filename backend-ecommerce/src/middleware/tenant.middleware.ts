import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host as string | undefined;

    if (!host) {
      return res.status(400).json({ message: 'Host header missing' });
    }

    // Exemple : fcchalon.wearenolt.net => slug = fcchalon
    const baseDomain = process.env.BASE_DOMAIN || 'wearenolt.net';

    let slug = host;
    if (host.endsWith(baseDomain)) {
      slug = host.replace(`.${baseDomain}`, '');
    }

    slug = slug.split('.')[0]; // garde uniquement le premier segment

    if (!slug) {
      return res.status(400).json({ message: 'Tenant slug not found' });
    }

    // On stocke dans l'objet requête pour les guards/services ultérieurs
    (req as any).tenantSlug = slug;
    req.headers['tenant_id'] = slug; // rétro-compat
    next();
  }
}
