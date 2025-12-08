import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Lấy request-id từ header hoặc generate mới
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Gắn vào request để các service khác dùng
    req.headers['x-request-id'] = requestId;

    // Gắn vào response header
    res.setHeader('x-request-id', requestId);

    next();
  }
}
