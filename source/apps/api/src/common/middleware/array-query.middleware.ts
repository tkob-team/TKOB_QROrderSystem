import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to transform array query params from status[]=VALUE format to status=[VALUE]
 * This allows NestJS ValidationPipe to properly handle array query parameters
 */
@Injectable()
export class ArrayQueryMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.query) {
      const keysToTransform: string[] = [];
      
      // Find keys that need transformation
      for (const key of Object.keys(req.query)) {
        if (key.endsWith('[]')) {
          keysToTransform.push(key);
        }
      }
      
      // Transform keys in-place
      for (const key of keysToTransform) {
        const cleanKey = key.slice(0, -2); // Remove []
        const value = req.query[key];
        if (value !== undefined) {
          delete req.query[key];
          req.query[cleanKey] = Array.isArray(value) ? value : [value];
        }
      }
    }
    
    next();
  }
}
