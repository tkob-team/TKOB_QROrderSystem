import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../database/prisma.service';
import * as jwt from 'jsonwebtoken'; // Cần cài: pnpm add jsonwebtoken @types/jsonwebtoken

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
      };
    }
  }
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantContextMiddleware.name);

  constructor(private readonly prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // VẤN ĐỀ: Middleware chạy trước Guard, nên req.user chưa tồn tại.
    // GIẢI PHÁP: Ta cần lấy tenantId từ Header (chuẩn RESTful) hoặc decode thô token.

    // Cách 1: Ưu tiên lấy từ Header (Nhanh, nhẹ, chuẩn cho các service gọi nhau)
    let tenantId = req.headers['x-tenant-id'] as string;

    // Cách 2: Nếu không có header, decode "thô" JWT để lấy tenantId (Fallback)
    if (!tenantId && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        try {
          // Decode không verify (vì verify sẽ tốn time, để Guard làm việc đó sau)
          const decoded: any = jwt.decode(token);
          if (decoded && decoded.tenantId) {
            tenantId = decoded.tenantId;
          }
        } catch (e) {
          this.logger.warn('Failed to decode token in middleware');
        }
      }
    }

    if (tenantId) {
      // Gán vào req để Controller tiện dùng
      req.tenant = { id: tenantId };
      res.setHeader('x-tenant-id', tenantId);
      this.logger.debug(`Tenant context initialized: ${tenantId}`);

      // QUAN TRỌNG NHẤT: Bọc next() vào trong AsyncLocalStorage
      // Điều này đảm bảo PrismaService "nhìn thấy" tenantId trong suốt request này
      this.prisma.runWithTenantId(tenantId, () => {
        next();
      });
    } else {
      // Nếu không có tenantId (ví dụ public route), chạy bình thường không có context
      next();
    }
  }
}
