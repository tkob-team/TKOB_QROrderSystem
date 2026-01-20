import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Guard for customer-only routes
 * Validates JWT token and ensures it's a customer (not tenant user)
 */
@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.tokenService.verifyToken(token);

      // Check if this is a customer token (role = 'CUSTOMER' and tenantId = 'NONE')
      if (payload.role !== 'CUSTOMER' || payload.tenantId !== 'NONE') {
        throw new UnauthorizedException('Invalid customer token');
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

      if (!customer) {
        throw new UnauthorizedException('Customer not found');
      }

      if (customer.status !== 'ACTIVE') {
        throw new UnauthorizedException('Customer account is not active');
      }

      // Attach customer to request
      request.customer = customer;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
