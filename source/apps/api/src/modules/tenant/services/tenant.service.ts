import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find tenant by ID
   */
  async getTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        // paymentConfig: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeTenantId?: string): Promise<boolean> {
    const existing = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    return !existing || existing.id === excludeTenantId;
  }

  /**
   * Update tenant status (Admin only)
   */
  async updateStatus(tenantId: string, status: TenantStatus) {
    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status },
    });

    this.logger.log(`Tenant status updated: ${tenantId} -> ${status}`);
    return updated;
  }

  // /**
  //  * Get tenant statistics
  //  */
  // async getStatistics(tenantId: string) {
  //   const [userCount, tableCount, menuItemCount, orderCount] = await Promise.all([
  //     this.prisma.user.count({ where: { tenantId } }),
  //     // this.prisma.table.count({ where: { tenantId } }),
  //     // this.prisma.menuItem.count({ where: { tenantId } }),
  //     // this.prisma.order.count({ where: { tenantId } }),
  //   ]);

  //   return {
  //     users: userCount,
  //     // tables: tableCount,
  //     // menuItems: menuItemCount,
  //     // orders: orderCount,
  //   };
  // }
}
