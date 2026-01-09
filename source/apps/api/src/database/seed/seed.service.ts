import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { MenuPhotoService } from '@/modules/menu/services/menu-photo.service';
import { UnsplashService } from './unplash.service';

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
      // Seed theo thứ tự phụ thuộc
      const categories = await this.seedCategories(tenantId);
      const modifiers = await this.seedModifiers(tenantId);
      const items = await this.seedMenuItems(tenantId, categories, modifiers);
      const tables = await this.seedTables(tenantId);

      this.logger.log(`✅ Seed completed for tenant ${tenantId}:
        - ${categories.length} categories
        - ${modifiers.length} modifier groups
        - ${items.length} menu items
        - ${tables.length} tables
      `);
    } catch (error) {
      this.logger.error(`❌ Seed failed for tenant ${tenantId}:`, error);
      throw error;
    }
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
      { name: 'Special Menu', description: 'Chef recommendations', order: 5 },
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

    const modifierGroups = [
      {
        name: 'Size',
        description: 'Choose your portion size',
        type: 'SINGLE_CHOICE' as const,
        required: true,
        minChoices: 1,
        maxChoices: 1,
        options: [
          { name: 'Small', priceDelta: -20000, order: 0 },
          { name: 'Medium', priceDelta: 0, order: 1 },
          { name: 'Large', priceDelta: 25000, order: 2 },
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
          { name: 'Extra Hot', priceDelta: 0, order: 3 },
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
          { name: 'Extra Cheese', priceDelta: 15000, order: 0 },
          { name: 'Bacon', priceDelta: 20000, order: 1 },
          { name: 'Mushrooms', priceDelta: 10000, order: 2 },
          { name: 'Olives', priceDelta: 10000, order: 3 },
          { name: 'Jalapeños', priceDelta: 12000, order: 4 },
        ],
      },
      {
        name: 'Side Dishes',
        description: 'Add a side dish',
        type: 'MULTI_CHOICE' as const,
        required: false,
        minChoices: 0,
        maxChoices: 3,
        options: [
          { name: 'French Fries', priceDelta: 25000, order: 0 },
          { name: 'Salad', priceDelta: 20000, order: 1 },
          { name: 'Soup', priceDelta: 30000, order: 2 },
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

    // Lấy categories theo tên
    const appetizers = categories.find((c) => c.name === 'Appetizers');
    const mains = categories.find((c) => c.name === 'Main Courses');
    const pasta = categories.find((c) => c.name === 'Pasta & Noodles');
    const desserts = categories.find((c) => c.name === 'Desserts');
    const beverages = categories.find((c) => c.name === 'Beverages');
    const special = categories.find((c) => c.name === 'Special Menu');

    // Lấy modifiers theo tên
    const sizeModifier = modifiers.find((m) => m.name === 'Size');
    const spiceModifier = modifiers.find((m) => m.name === 'Spice Level');
    const toppingsModifier = modifiers.find((m) => m.name === 'Extra Toppings');
    const sidesModifier = modifiers.find((m) => m.name === 'Side Dishes');

    const menuItems = [
      // Appetizers
      {
        categoryId: appetizers.id,
        name: 'Spring Rolls',
        description: 'Crispy Vietnamese spring rolls with sweet chili sauce',
        price: 45,
        preparationTime: 10,
        tags: ['vegetarian', 'popular'],
        allergens: ['gluten'],
        modifierIds: [sizeModifier.id],
        photoQuery: 'vietnamese spring rolls', // Từ khóa tìm ảnh
      },
      {
        categoryId: appetizers.id,
        name: 'Chicken Wings',
        description: 'Buffalo style chicken wings with ranch dressing',
        price: 65,
        preparationTime: 15,
        tags: ['spicy', 'popular'],
        allergens: ['dairy'],
        modifierIds: [sizeModifier.id, spiceModifier.id],
        photoQuery: 'buffalo chicken wings',
      },
      {
        categoryId: appetizers.id,
        name: 'Calamari Rings',
        description: 'Deep fried squid rings with tartar sauce',
        price: 75,
        preparationTime: 12,
        tags: ['seafood'],
        allergens: ['seafood', 'gluten'],
        modifierIds: [sizeModifier.id],
        photoQuery: 'fried calamari',
      },

      // Main Courses
      {
        categoryId: mains.id,
        name: 'Grilled Beef Steak',
        description: 'Premium beef steak with mushroom sauce',
        price: 250,
        preparationTime: 25,
        tags: ['signature', 'popular'],
        allergens: [],
        chefRecommended: true,
        modifierIds: [sizeModifier.id, sidesModifier.id],
        photoQuery: 'grilled beef steak mushroom sauce',
      },
      {
        categoryId: mains.id,
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with lemon butter',
        price: 220,
        preparationTime: 20,
        tags: ['healthy', 'seafood'],
        allergens: ['fish'],
        chefRecommended: true,
        modifierIds: [sizeModifier.id, sidesModifier.id],
        photoQuery: 'grilled salmon lemon',
      },
      {
        categoryId: mains.id,
        name: 'Chicken Teriyaki',
        description: 'Grilled chicken with Japanese teriyaki sauce',
        price: 120,
        preparationTime: 18,
        tags: ['japanese', 'popular'],
        allergens: ['soy'],
        modifierIds: [sizeModifier.id, sidesModifier.id],
        photoQuery: 'chicken teriyaki',
      },

      // Pasta & Noodles
      {
        categoryId: pasta.id,
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta with bacon and cream sauce',
        price: 95,
        preparationTime: 15,
        tags: ['italian', 'popular'],
        allergens: ['dairy', 'gluten', 'eggs'],
        modifierIds: [sizeModifier.id, toppingsModifier.id],
        photoQuery: 'spaghetti carbonara',
      },
      {
        categoryId: pasta.id,
        name: 'Pad Thai',
        description: 'Thai stir-fried noodles with shrimp',
        price: 85,
        preparationTime: 12,
        tags: ['thai', 'seafood'],
        allergens: ['seafood', 'peanuts'],
        modifierIds: [sizeModifier.id, spiceModifier.id],
        photoQuery: 'pad thai shrimp',
      },
      {
        categoryId: pasta.id,
        name: 'Pho Bo',
        description: 'Vietnamese beef noodle soup',
        price: 75,
        preparationTime: 20,
        tags: ['vietnamese', 'popular'],
        allergens: [],
        modifierIds: [sizeModifier.id],
        photoQuery: 'pho bo vietnamese',
      },

      // Desserts
      {
        categoryId: desserts.id,
        name: 'Tiramisu',
        description: 'Classic Italian coffee-flavored dessert',
        price: 55,
        preparationTime: 5,
        tags: ['italian', 'coffee'],
        allergens: ['dairy', 'eggs', 'gluten'],
        modifierIds: [],
        photoQuery: 'tiramisu dessert',
      },
      {
        categoryId: desserts.id,
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center',
        price: 65,
        preparationTime: 15,
        tags: ['chocolate', 'popular'],
        allergens: ['dairy', 'eggs', 'gluten'],
        modifierIds: [],
        photoQuery: 'chocolate lava cake',
      },

      // Beverages
      {
        categoryId: beverages.id,
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 35,
        preparationTime: 3,
        tags: ['fresh', 'healthy'],
        allergens: [],
        modifierIds: [sizeModifier.id],
        photoQuery: 'fresh orange juice',
      },
      {
        categoryId: beverages.id,
        name: 'Iced Vietnamese Coffee',
        description: 'Strong Vietnamese coffee with condensed milk',
        price: 40,
        preparationTime: 5,
        tags: ['vietnamese', 'coffee', 'popular'],
        allergens: ['dairy'],
        modifierIds: [sizeModifier.id],
        photoQuery: 'vietnamese iced coffee',
      },

      // Special Menu
      {
        categoryId: special.id,
        name: "Chef's Special Pizza",
        description: 'Our signature pizza with premium toppings',
        price: 180,
        preparationTime: 30,
        tags: ['signature', 'popular'],
        allergens: ['dairy', 'gluten'],
        chefRecommended: true,
        modifierIds: [sizeModifier.id, toppingsModifier.id],
        photoQuery: 'gourmet pizza',
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

      // Step 2: Upload photo if photoQuery exists
      if (photoQuery) {
        try {
          // Search multiple photos
          const photoUrls = await this.unsplash.searchMultiplePhotos(photoQuery, 3); // Get 3 photos

          const mockFiles: Express.Multer.File[] = [];
          for (const url of photoUrls) {
            const buffer = await this.downloadPhotoToBuffer(url);
            mockFiles.push({
              fieldname: 'files',
              originalname: `${itemData.name}-${mockFiles.length}.jpg`,
              encoding: '7bit',
              mimetype: 'image/jpeg',
              buffer,
              size: buffer.length,
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

    const tables = [
      // Main Hall
      { tableNumber: 'A1', capacity: 2, location: 'Main Hall', order: 0 },
      { tableNumber: 'A2', capacity: 2, location: 'Main Hall', order: 1 },
      { tableNumber: 'A3', capacity: 4, location: 'Main Hall', order: 2 },
      { tableNumber: 'A4', capacity: 4, location: 'Main Hall', order: 3 },
      { tableNumber: 'A5', capacity: 6, location: 'Main Hall', order: 4 },

      // Terrace
      { tableNumber: 'T1', capacity: 2, location: 'Terrace', order: 5 },
      { tableNumber: 'T2', capacity: 4, location: 'Terrace', order: 6 },
      { tableNumber: 'T3', capacity: 4, location: 'Terrace', order: 7 },

      // VIP Room
      { tableNumber: 'VIP-1', capacity: 8, location: 'VIP Room', order: 8 },
      { tableNumber: 'VIP-2', capacity: 10, location: 'VIP Room', order: 9 },
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
   * OPTIONAL: Seed demo user (Staff account)
   */
  async seedDemoStaffUser(tenantId: string, ownerEmail: string): Promise<void> {
    const staffEmail = ownerEmail.replace('@', '+staff@');

    const existingStaff = await this.prisma.user.findFirst({
      where: { email: staffEmail, tenantId },
    });

    if (existingStaff) {
      this.logger.debug(`Staff user already exists: ${staffEmail}`);
      return;
    }

    const passwordHash = await bcrypt.hash('Staff@123', 10);

    await this.prisma.user.create({
      data: {
        email: staffEmail,
        passwordHash,
        fullName: 'Demo Staff',
        role: 'STAFF',
        status: 'ACTIVE',
        tenantId,
      },
    });

    this.logger.log(`✅ Created demo staff account: ${staffEmail} / Staff@123`);
  }
}
