import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MenuPhotoService } from '@/modules/menu/services/menu-photo.service';
import { UnsplashService } from './unplash.service';
import {
  SubscriptionTier,
  SubscriptionStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Seed Service - Tạo dữ liệu demo cho tenant mới
 *
 * Chiến lược:
 * 1. Seed Categories (5-7 categories)
 * 2. Seed Modifier Groups (3-5 groups)
 * 3. Seed Menu Items (15-20 items) với photos
 * 4. Seed Tables (10-15 bàn) với QR codes
 * 5. Link modifiers vào items
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly unsplash: UnsplashService,
    private readonly menuPhotoService: MenuPhotoService, // Add this
  ) {}

  /**
   * MAIN SEED FUNCTION
   * Được gọi sau khi tenant register thành công
   */
  async seedTenantData(tenantId: string): Promise<void> {
    this.logger.log(`🌱 Starting seed data for tenant: ${tenantId}`);

    try {
      // Step 0: Create FREE subscription first
      await this.createFreeSubscription(tenantId);

      // Seed theo thứ tự phụ thuộc
      const categories = await this.seedCategories(tenantId);
      const modifiers = await this.seedModifiers(tenantId);
      const items = await this.seedMenuItems(tenantId, categories, modifiers);
      const tables = await this.seedTables(tenantId);

      // Seed demo orders và reviews (để có rating data)
      const { orders, reviews } = await this.seedOrdersAndReviews(tenantId, items, tables);

      this.logger.log(`✅ Seed completed for tenant ${tenantId}:
        - ${categories.length} categories
        - ${modifiers.length} modifier groups
        - ${items.length} menu items
        - ${tables.length} tables
        - ${orders.length} demo orders
        - ${reviews.length} demo reviews
      `);
    } catch (error) {
      this.logger.error(`❌ Seed failed for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Seed Subscription Plans (run once on startup)
   * DB-driven pricing - can be updated without deploy
   */
  async seedSubscriptionPlans(): Promise<void> {
    this.logger.log('🌱 Seeding subscription plans...');

    const plans = [
      {
        tier: SubscriptionTier.FREE,
        name: 'Free',
        description: 'Perfect for trying out TKOB. Free forever with basic limits.',
        priceUSD: 0,
        priceVND: 0,
        maxTables: 1,
        maxMenuItems: 10,
        maxOrdersMonth: 100,
        maxStaff: 1,
        features: {
          analytics: false,
          promotions: false,
          customBranding: false,
          prioritySupport: false,
        },
      },
      {
        tier: SubscriptionTier.BASIC,
        name: 'Basic',
        description: 'Great for small restaurants. More tables and menu items.',
        priceUSD: 1,
        priceVND: 25000,
        maxTables: 10,
        maxMenuItems: 50,
        maxOrdersMonth: 500,
        maxStaff: 5,
        features: {
          analytics: true,
          promotions: true,
          customBranding: false,
          prioritySupport: false,
        },
      },
      {
        tier: SubscriptionTier.PREMIUM,
        name: 'Premium',
        description: 'Unlimited everything for growing businesses.',
        priceUSD: 2,
        priceVND: 50000, // 2 * 50000
        maxTables: -1, // Unlimited
        maxMenuItems: -1,
        maxOrdersMonth: -1,
        maxStaff: -1,
        features: {
          analytics: true,
          promotions: true,
          customBranding: true,
          prioritySupport: true,
        },
      },
    ];

    for (const plan of plans) {
      await this.prisma.subscriptionPlan.upsert({
        where: { tier: plan.tier },
        update: {
          name: plan.name,
          description: plan.description,
          priceUSD: plan.priceUSD,
          priceVND: plan.priceVND,
          maxTables: plan.maxTables,
          maxMenuItems: plan.maxMenuItems,
          maxOrdersMonth: plan.maxOrdersMonth,
          maxStaff: plan.maxStaff,
          features: plan.features,
          isActive: true,
        },
        create: {
          tier: plan.tier,
          name: plan.name,
          description: plan.description,
          priceUSD: plan.priceUSD,
          priceVND: plan.priceVND,
          maxTables: plan.maxTables,
          maxMenuItems: plan.maxMenuItems,
          maxOrdersMonth: plan.maxOrdersMonth,
          maxStaff: plan.maxStaff,
          features: plan.features,
          isActive: true,
        },
      });
    }

    this.logger.log('✅ Subscription plans seeded successfully');
  }

  /**
   * Create FREE subscription for new tenant
   */
  async createFreeSubscription(tenantId: string): Promise<void> {
    // Get FREE plan
    const freePlan = await this.prisma.subscriptionPlan.findUnique({
      where: { tier: SubscriptionTier.FREE },
    });

    if (!freePlan) {
      this.logger.error('FREE plan not found. Run seedSubscriptionPlans first.');
      return;
    }

    // Check if subscription already exists
    const existing = await this.prisma.tenantSubscription.findUnique({
      where: { tenantId },
    });

    if (existing) {
      this.logger.debug(`Subscription already exists for tenant ${tenantId}`);
      return;
    }

    // Create subscription
    await this.prisma.tenantSubscription.create({
      data: {
        tenantId,
        planId: freePlan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: null, // FREE never expires
        ordersThisMonth: 0,
        usageResetAt: new Date(),
      },
    });

    this.logger.log(`✅ Created FREE subscription for tenant ${tenantId}`);
  }

  /**
   * STEP 1: Seed Categories
   */
  private async seedCategories(tenantId: string) {
    this.logger.debug(`Seeding categories for ${tenantId}...`);

    const categories = [
      {
        name: 'Appetizers',
        description: 'Start your meal with these delicious starters',
        order: 0,
      },
      { name: 'Main Courses', description: 'Our signature main dishes', order: 1 },
      { name: 'Pasta & Noodles', description: 'Italian pasta and Asian noodles', order: 2 },
      { name: 'Desserts', description: 'Sweet endings to your meal', order: 3 },
      { name: 'Beverages', description: 'Refreshing drinks', order: 4 },
    ];

    const created = [] as any[];
    for (const cat of categories) {
      const category = await this.prisma.menuCategory.create({
        data: {
          tenantId,
          name: cat.name,
          description: cat.description,
          displayOrder: cat.order,
          active: true,
        },
      });
      created.push(category);
    }

    return created;
  }

  /**
   * STEP 2: Seed Modifier Groups
   */
  private async seedModifiers(tenantId: string) {
    this.logger.debug(`Seeding modifiers for ${tenantId}...`);

    // Reduced to 3 modifier groups for faster seeding
    const modifierGroups = [
      {
        name: 'Size',
        description: 'Choose your portion size',
        type: 'SINGLE_CHOICE' as const,
        required: true,
        minChoices: 1,
        maxChoices: 1,
        options: [
          { name: 'Small', priceDelta: 0, order: 0 },
          { name: 'Medium', priceDelta: 0.5, order: 1 },
          { name: 'Large', priceDelta: 1.0, order: 2 },
        ],
      },
      {
        name: 'Spice Level',
        description: 'How spicy do you want it?',
        type: 'SINGLE_CHOICE' as const,
        required: false,
        minChoices: 0,
        maxChoices: 1,
        options: [
          { name: 'Mild', priceDelta: 0, order: 0 },
          { name: 'Medium', priceDelta: 0, order: 1 },
          { name: 'Hot', priceDelta: 0, order: 2 },
        ],
      },
      {
        name: 'Extra Toppings',
        description: 'Add extra toppings',
        type: 'MULTI_CHOICE' as const,
        required: false,
        minChoices: 0,
        maxChoices: 5,
        options: [
          { name: 'Extra Cheese', priceDelta: 0.6, order: 0 },
          { name: 'Bacon', priceDelta: 0.8, order: 1 },
          { name: 'Mushrooms', priceDelta: 0.4, order: 2 },
        ],
      },
    ];

    const created = [] as any[];
    for (const group of modifierGroups) {
      const { options, ...groupData } = group;

      const modifier = await this.prisma.modifierGroup.create({
        data: {
          tenantId,
          ...groupData,
          options: {
            create: options.map((opt) => ({
              name: opt.name,
              priceDelta: opt.priceDelta,
              displayOrder: opt.order,
            })),
          },
        },
        include: { options: true },
      });

      created.push(modifier);
    }

    return created;
  }

  /**
   * STEP 3: Seed Menu Items with Photos
   */
  private async seedMenuItems(tenantId: string, categories: any[], modifiers: any[]) {
    this.logger.debug(`Seeding menu items for ${tenantId}...`);

    // Lấy categories theo tên (reduced to 5 categories)
    const appetizers = categories.find((c) => c.name === 'Appetizers');
    const mains = categories.find((c) => c.name === 'Main Courses');
    const pasta = categories.find((c) => c.name === 'Pasta & Noodles');
    const desserts = categories.find((c) => c.name === 'Desserts');
    const beverages = categories.find((c) => c.name === 'Beverages');

    // Lấy modifiers theo tên (reduced to 3 groups)
    const sizeModifier = modifiers.find((m) => m.name === 'Size');
    const spiceModifier = modifiers.find((m) => m.name === 'Spice Level');
    const toppingsModifier = modifiers.find((m) => m.name === 'Extra Toppings');

    // Reduced to 10 menu items for faster seeding
    const menuItems = [
      // Appetizers (2 items)
      {
        categoryId: appetizers.id,
        name: 'Spring Rolls',
        description: 'Crispy Vietnamese spring rolls with sweet chili sauce',
        price: 4.5,
        preparationTime: 10,
        tags: ['vegetarian', 'popular'],
        allergens: ['gluten'],
        modifierIds: [sizeModifier.id],
        photoQuery: 'spring rolls food',
      },
      {
        categoryId: appetizers.id,
        name: 'Chicken Wings',
        description: 'Buffalo style chicken wings with ranch dressing',
        price: 6.5,
        preparationTime: 15,
        tags: ['spicy', 'popular'],
        allergens: ['dairy'],
        modifierIds: [sizeModifier.id, spiceModifier.id],
        photoQuery: 'chicken wings food',
      },

      // Main Courses (3 items)
      {
        categoryId: mains.id,
        name: 'Grilled Beef Steak',
        description: 'Premium beef steak with mushroom sauce',
        price: 25.0,
        preparationTime: 25,
        tags: ['signature', 'popular'],
        allergens: [],
        chefRecommended: true,
        modifierIds: [sizeModifier.id, toppingsModifier.id],
        photoQuery: 'beef steak food',
      },
      {
        categoryId: mains.id,
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with lemon butter',
        price: 22.0,
        preparationTime: 20,
        tags: ['healthy', 'seafood'],
        allergens: ['fish'],
        chefRecommended: true,
        modifierIds: [sizeModifier.id, toppingsModifier.id],
        photoQuery: 'salmon food',
      },
      {
        categoryId: mains.id,
        name: 'Chicken Teriyaki',
        description: 'Grilled chicken with Japanese teriyaki sauce',
        price: 12.0,
        preparationTime: 18,
        tags: ['japanese', 'popular'],
        allergens: ['soy'],
        modifierIds: [sizeModifier.id],
        photoQuery: 'teriyaki chicken food',
      },

      // Pasta & Noodles (2 items)
      {
        categoryId: pasta.id,
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta with bacon and cream sauce',
        price: 9.5,
        preparationTime: 15,
        tags: ['italian', 'popular'],
        allergens: ['dairy', 'gluten', 'eggs'],
        modifierIds: [sizeModifier.id, toppingsModifier.id],
        photoQuery: 'carbonara pasta food',
      },
      {
        categoryId: pasta.id,
        name: 'Pad Thai',
        description: 'Thai stir-fried noodles with shrimp',
        price: 8.5,
        preparationTime: 12,
        tags: ['thai', 'seafood'],
        allergens: ['seafood', 'peanuts'],
        modifierIds: [sizeModifier.id, spiceModifier.id],
        photoQuery: 'pad thai food',
      },

      // Desserts (1 item)
      {
        categoryId: desserts.id,
        name: 'Tiramisu',
        description: 'Classic Italian coffee-flavored dessert',
        price: 5.5,
        preparationTime: 5,
        tags: ['italian', 'coffee'],
        allergens: ['dairy', 'eggs', 'gluten'],
        modifierIds: [],
        photoQuery: 'tiramisu dessert',
      },

      // Beverages (2 items)
      {
        categoryId: beverages.id,
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 3.5,
        preparationTime: 3,
        tags: ['fresh', 'healthy'],
        allergens: [],
        modifierIds: [sizeModifier.id],
        photoQuery: 'orange juice drink',
      },
      {
        categoryId: beverages.id,
        name: 'Iced Vietnamese Coffee',
        description: 'Strong Vietnamese coffee with condensed milk',
        price: 1.0,
        preparationTime: 5,
        tags: ['vietnamese', 'coffee', 'popular'],
        allergens: ['dairy'],
        modifierIds: [sizeModifier.id],
        photoQuery: 'vietnamese coffee drink',
      },
    ];

    const created = [] as any[];
    for (const item of menuItems) {
      const { modifierIds, photoQuery, ...itemData } = item;

      // Step 1: Create menu item WITHOUT photo
      const menuItem = await this.prisma.menuItem.create({
        data: {
          tenantId,
          ...itemData,
          imageUrl: null, // Will be set when primary photo is uploaded
          status: 'PUBLISHED',
          available: true,
          popularity: Math.floor(Math.random() * 100),
        },
      });

      // Step 2: Fetch photo from Unsplash and upload
      if (photoQuery) {
        try {
          // 1. Fetch photo URL from Unsplash using the query
          const photoUrl = await this.unsplash.searchPhoto(photoQuery);

          if (!photoUrl) {
            this.logger.warn(`No photo found on Unsplash for query: "${photoQuery}"`);
            continue;
          }

          // 2. Download the photo buffer once
          const sharedBuffer = await this.downloadPhotoToBuffer(photoUrl);

          const mockFiles: Express.Multer.File[] = [];
          const numberOfFiles = 3; // Number of photos to create

          // 3. Create mock Multer files with the same buffer
          for (let i = 0; i < numberOfFiles; i++) {
            mockFiles.push({
              fieldname: 'files',
              originalname: `${itemData.name}-${i}.jpg`,
              encoding: '7bit',
              mimetype: 'image/jpeg',
              buffer: sharedBuffer,
              size: sharedBuffer.length,
              stream: null as any,
              destination: '',
              filename: '',
              path: '',
            });
          }

          // Upload multiple photos at once
          await this.menuPhotoService.uploadPhotos(menuItem.id, mockFiles);
        } catch (error) {
          this.logger.warn(`Failed to upload photos for "${itemData.name}":`, error);
        }
      }

      // Step 3: Link modifiers
      if (modifierIds && modifierIds.length > 0) {
        await this.prisma.menuItemModifier.createMany({
          data: modifierIds.map((modId, index) => ({
            menuItemId: menuItem.id,
            modifierGroupId: modId,
            displayOrder: index,
          })),
        });
      }

      created.push(menuItem);
    }

    return created;
  }

  /**
   * Helper: Download photo from URL to Buffer
   */
  private async downloadPhotoToBuffer(url: string): Promise<Buffer> {
    const https = await import('https');

    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }

          const chunks: Buffer[] = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        })
        .on('error', reject);
    });
  }

  /**
   * STEP 4: Seed Tables
   */
  private async seedTables(tenantId: string) {
    this.logger.debug(`Seeding tables for ${tenantId}...`);

    // Reduced to 5 tables for faster seeding
    const tables = [
      { tableNumber: '1', capacity: 2, location: 'Main Hall', order: 0 },
      { tableNumber: '2', capacity: 2, location: 'Main Hall', order: 1 },
      { tableNumber: '3', capacity: 4, location: 'Main Hall', order: 2 },
      { tableNumber: '4', capacity: 4, location: 'Main Hall', order: 3 },
      { tableNumber: '5', capacity: 6, location: 'Main Hall', order: 4 },
    ];

    const created = [] as any[];
    for (const table of tables) {
      // Import QrService để generate QR
      const crypto = await import('crypto');
      const payload = {
        tableId: 'temp-id', // Sẽ update sau
        tenantId,
        timestamp: Date.now(),
      };

      const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const signature = crypto
        .createHmac('sha256', secret)
        .update(payloadBase64)
        .digest('base64url');
      const token = `${payloadBase64}.${signature}`;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const createdTable = await this.prisma.table.create({
        data: {
          tenantId,
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          location: table.location,
          displayOrder: table.order,
          status: 'AVAILABLE',
          active: true,
          qrToken: token,
          qrTokenHash: tokenHash,
          qrTokenCreatedAt: new Date(),
        },
      });

      created.push(createdTable);
    }

    return created;
  }

  /**
   * SEED DEMO ORDERS AND REVIEWS
   * Tạo orders hoàn thành với reviews để hiển thị rating trên menu
   */
  private async seedOrdersAndReviews(
    tenantId: string,
    menuItems: { id: string; name: string; price: Decimal }[],
    tables: { id: string; tableNumber: string }[],
  ): Promise<{
    orders: { id: string }[];
    reviews: { id: string }[];
  }> {
    const orders: { id: string }[] = [];
    const reviews: { id: string }[] = [];

    if (menuItems.length === 0 || tables.length === 0) {
      this.logger.warn('No menu items or tables to create demo orders');
      return { orders, reviews };
    }

    // Sample review comments
    const positiveComments = [
      'Excellent! Highly recommend.',
      'Amazing taste, will order again!',
      'Perfect portion size and flavor.',
      "One of the best dishes I've had.",
      'Fresh and delicious!',
      'Great value for money.',
      'Perfectly cooked!',
    ];

    const neutralComments = [
      'Good food, nice presentation.',
      'Decent portion, tasty.',
      'Solid choice.',
      'Pretty good overall.',
    ];

    // Sample reviewer names
    const reviewerNames = [
      'John D.',
      'Sarah M.',
      'Mike T.',
      'Emily L.',
      'David K.',
      'Lisa P.',
      'James H.',
      'Anna W.',
      'Chris B.',
      'Maria S.',
    ];

    // Create 3-5 demo orders with reviews
    const numOrders = Math.min(5, tables.length);

    for (let i = 0; i < numOrders; i++) {
      const table = tables[i % tables.length];

      // Create a completed table session (clearedAt = ended)
      const pastDate = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000);
      const session = await this.prisma.tableSession.create({
        data: {
          tenantId,
          tableId: table.id,
          scannedAt: pastDate,
          active: false, // Session is done
          clearedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        },
      });

      // Select 2-4 random menu items for this order
      const numItems = Math.floor(Math.random() * 3) + 2;
      const selectedItems = this.shuffleArray([...menuItems]).slice(0, numItems);

      // Calculate total
      let subtotal = new Decimal(0);
      const orderItemsData = selectedItems.map((item) => {
        const quantity = Math.floor(Math.random() * 2) + 1;
        const itemTotal = item.price.mul(quantity);
        subtotal = subtotal.add(itemTotal);
        return {
          menuItemId: item.id,
          name: item.name,
          quantity,
          price: item.price,
          itemTotal,
          notes: null,
          modifiers: [],
        };
      });

      const total = subtotal.mul(1.1); // 10% tax

      // Create completed order (PAID status, COMPLETED payment)
      const order = await this.prisma.order.create({
        data: {
          tenantId,
          tableId: table.id,
          sessionId: session.id,
          orderNumber: `DEMO-${Date.now()}-${i}`,
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentMethod: PaymentMethod.CASH,
          subtotal,
          tax: subtotal.mul(0.1),
          tip: new Decimal(0),
          total,
          paidAt: session.clearedAt,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      orders.push({ id: order.id });

      // Create reviews for 50-100% of items in this order
      const itemsToReview = order.items.filter(() => Math.random() > 0.3);

      for (const orderItem of itemsToReview) {
        const rating =
          Math.random() > 0.3
            ? Math.floor(Math.random() * 2) + 4 // 4-5 stars (70%)
            : Math.floor(Math.random() * 2) + 3; // 3-4 stars (30%)

        const comments = rating >= 4 ? positiveComments : neutralComments;
        const comment = comments[Math.floor(Math.random() * comments.length)];
        
        // Pick a random reviewer name (70% chance to have a name)
        const reviewerName = Math.random() > 0.3
          ? reviewerNames[Math.floor(Math.random() * reviewerNames.length)]
          : null;

        const review = await this.prisma.itemReview.create({
          data: {
            tenantId,
            orderItemId: orderItem.id,
            sessionId: session.id,
            rating,
            comment,
            reviewerName,
          },
        });

        reviews.push({ id: review.id });
      }
    }

    return { orders, reviews };
  }

  /**
   * Utility: Shuffle array (Fisher-Yates)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
