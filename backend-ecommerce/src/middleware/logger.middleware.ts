import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`📡 [${req.method}] ${req.url}`);
    console.log('Headers:', {
      authorization: req.headers.authorization ? 'Bearer [...]' : 'None',
      'content-type': req.headers['content-type'],
      'x-tenant-id': req.headers['x-tenant-id']
    });
    
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      console.log('Token présent:', token ? '✅' : '❌');
    }

    next();
  }
}
