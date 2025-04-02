import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host; // Ex: client1.monsite.com
    const tenant = host?.split('.')[0]; // On extrait "client1"

    if (!tenant) {
      return res.status(400).json({ message: 'Tenant ID missing in domain' });
    }

    req.headers['tenant_id'] = tenant; // On injecte le tenant ID dans la requête
    next();
  }
}
