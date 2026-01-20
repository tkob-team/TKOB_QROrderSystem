import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Optional customer auth guard - does NOT throw if no token present
 * Attaches customer to request if valid token provided, otherwise continues
 * Used for endpoints that support both authenticated and anonymous users
 */
@Injectable()
export class OptionalCustomerAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // No token? Allow request but don't attach customer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true;
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.tokenService.verifyToken(token);

      // Check if this is a customer token (role = 'CUSTOMER' and tenantId = 'NONE')
      if (payload.role !== 'CUSTOMER' || payload.tenantId !== 'NONE') {
        // Not a customer token, allow request but don't attach customer
        return true;
      }

      // Verify customer exists and is active
      const customer = await this.prisma.customer.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          status: true,
        },
      });

      if (customer && customer.status === 'ACTIVE') {
        // Attach customer to request
        request.customer = customer;
      }

      return true;
    } catch {
      // Invalid token? Allow request but don't attach customer
      return true;
    }
  }
}
