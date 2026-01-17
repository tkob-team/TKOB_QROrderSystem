import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TenantStatus } from '@prisma/client';

export interface TenantPricingSettings {
  currency: string;
  tax: {
    enabled: boolean;
    rate: number;
    label: string;
    includedInPrice: boolean;
  };
  serviceCharge: {
    enabled: boolean;
    rate: number;
    label: string;
  };
  tip: {
    enabled: boolean;
    suggestions: number[];
    allowCustom: boolean;
  };
}

const DEFAULT_PRICING_SETTINGS: TenantPricingSettings = {
  currency: 'USD',
  tax: {
    enabled: true,
    rate: 8, // Government-mandated tax rate (8% VAT)
    label: 'VAT',
    includedInPrice: false,
  },
  serviceCharge: {
    enabled: false,
    rate: 5,
    label: 'Service Charge',
  },
  tip: {
    enabled: true,
    suggestions: [10, 15, 20],
    allowCustom: true,
  },
};

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
   * Get tenant pricing settings (tax, service charge, tip)
   * Used by checkout flow
   */
  async getPricingSettings(tenantId: string): Promise<TenantPricingSettings> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const settings = (tenant.settings as Record<string, any>) || {};

    // Merge with defaults
    return {
      currency: settings.currency || DEFAULT_PRICING_SETTINGS.currency,
      tax: {
        ...DEFAULT_PRICING_SETTINGS.tax,
        ...settings.tax,
      },
      serviceCharge: {
        ...DEFAULT_PRICING_SETTINGS.serviceCharge,
        ...settings.serviceCharge,
      },
      tip: {
        ...DEFAULT_PRICING_SETTINGS.tip,
        ...settings.tip,
      },
    };
  }

  /**
   * Find tenant by slug (for public access)
   */
  async getTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        settings: true,
        openingHours: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Restaurant not found');
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
