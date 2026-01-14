/**
 * Menu Mock Adapter (structured)
 * Mock data for development/testing
 */

import { logger } from '@/shared/utils/logger';
import { samplePayload } from '@/shared/utils/dataInspector';

const logFullDataEnabled =
  process.env.NEXT_PUBLIC_LOG_DATA === 'true' &&
  process.env.NEXT_PUBLIC_LOG_DATA_FULL === 'true';
const menuAllowKeys = ['name', 'description', 'title', 'label', 'note'];
import { mockCategories, mockMenuItems, mockModifierGroups } from './menu-data';

/**
 * Menu Categories Mock
 */
export const menuCategoriesMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories;
  },
  async findOne(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const category = mockCategories.find(c => c.id === id);
    if (!category) throw new Error(`Category ${id} not found`);
    return category;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'category.create',
        payload: samplePayload(data, { allowKeys: menuAllowKeys }),
      });
    }
    const maxDisplayOrder = mockCategories.reduce((max, cat) => Math.max(max, cat.displayOrder || 0), -1);
    const newCategory = { 
      id: Date.now().toString(), 
      displayOrder: maxDisplayOrder + 1,
      active: true,
      itemCount: 0,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'category.create',
        data: samplePayload(newCategory, { allowKeys: menuAllowKeys }),
      });
    }
    mockCategories.push(newCategory);
    return newCategory;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'category.update',
        payload: samplePayload({ id, ...data }, { allowKeys: menuAllowKeys }),
      });
    }
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories[index] = { 
        ...mockCategories[index], 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      if (logFullDataEnabled) {
        logger.info('[mock] RESPONSE', {
          feature: 'menu',
          op: 'category.update',
          data: samplePayload(mockCategories[index], { allowKeys: menuAllowKeys }),
        });
      }
      return mockCategories[index];
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'category.delete',
        payload: samplePayload({ id }),
      });
    }
    const index = mockCategories.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'category.delete',
        data: samplePayload({ success: true }),
      });
    }
    return { success: true };
  },
};

/**
 * Menu Items Mock
 */
export const menuItemsMock = {
  async findAll(params?: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const allItems = mockMenuItems.map(item => {
      const modifierGroups = item.modifierGroupIds
        ? mockModifierGroups.filter(mg => item.modifierGroupIds?.includes(mg.id))
        : [];
      const category = mockCategories.find(cat => cat.id === item.categoryId);
      return {
        ...item,
        category,
        categoryName: category?.name,
        status: (item as any).status ?? 'DRAFT',
        available: (item as any).available ?? (item as any).isAvailable ?? true,
        isAvailable: (item as any).available ?? (item as any).isAvailable ?? true,
        dietary: item.tags ?? (item as any).dietary ?? [],
        modifierGroups,
      };
    });
    return allItems;
  },
  async findOne(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === id);
    if (!item) throw new Error(`Item ${id} not found`);
    const modifierGroups = item.modifierGroupIds
      ? mockModifierGroups.filter(mg => item.modifierGroupIds?.includes(mg.id))
      : [];
    const category = mockCategories.find(cat => cat.id === item.categoryId);
    return {
      ...item,
      category,
      categoryName: category?.name,
      status: (item as any).status ?? 'DRAFT',
      available: (item as any).available ?? (item as any).isAvailable ?? true,
      isAvailable: (item as any).available ?? (item as any).isAvailable ?? true,
      dietary: item.tags ?? (item as any).dietary ?? [],
      modifierGroups,
    };
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'item.create',
        payload: samplePayload(data, { allowKeys: menuAllowKeys }),
      });
    }
    const newItem = {
      id: Date.now().toString(),
      status: (data as any).status ?? 'DRAFT',
      available: (data as any).available ?? true,
      isAvailable: (data as any).available ?? true,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'item.create',
        data: samplePayload(newItem, { allowKeys: menuAllowKeys }),
      });
    }
    mockMenuItems.push(newItem);
    return newItem;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'item.update',
        payload: samplePayload({ id, ...data }, { allowKeys: menuAllowKeys }),
      });
    }
    const index = mockMenuItems.findIndex(i => i.id === id);
    if (index !== -1) {
      mockMenuItems[index] = { 
        ...mockMenuItems[index], 
        ...data,
        available: (data as any).available ?? (mockMenuItems[index] as any).available,
        status: (data as any).status ?? (mockMenuItems[index] as any).status ?? 'DRAFT',
        updatedAt: new Date().toISOString(),
      };
      if (logFullDataEnabled) {
        logger.info('[mock] RESPONSE', {
          feature: 'menu',
          op: 'item.update',
          data: samplePayload(mockMenuItems[index], { allowKeys: menuAllowKeys }),
        });
      }
      return mockMenuItems[index];
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'item.delete',
        payload: samplePayload({ id }),
      });
    }
    const item = mockMenuItems.find(i => i.id === id);
    if (item) {
      (item as any).status = 'ARCHIVED';
      item.updatedAt = new Date().toISOString();
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'item.delete',
        data: samplePayload({ success: true }),
      });
    }
    return { success: true };
  },
  async toggleAvailability(id: string, data: { isAvailable: boolean }) {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'item.toggleAvailability',
        payload: samplePayload({ id, ...data }, { allowKeys: menuAllowKeys }),
      });
    }
    const item = mockMenuItems.find(i => i.id === id);
    if (item) {
      item.available = data.isAvailable;
      (item as any).isAvailable = data.isAvailable;
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'item.toggleAvailability',
        data: samplePayload({ success: true }),
      });
    }
    return { success: true } as any;
  },
};

/**
 * Modifiers Mock
 */
export const modifiersMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockModifierGroups;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'modifier.create',
        payload: samplePayload(data, { allowKeys: menuAllowKeys }),
      });
    }
    const newGroup = {
      id: Date.now().toString(),
      active: true,
      ...data,
      options: data.options || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (mockModifierGroups as any).push(newGroup);
    logger.debug('[menu:mock] MODIFIER_CREATED', { count: mockModifierGroups.length });
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'modifier.create',
        data: samplePayload(newGroup, { allowKeys: menuAllowKeys }),
      });
    }
    return newGroup;
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'modifier.update',
        payload: samplePayload({ id, ...data }, { allowKeys: menuAllowKeys }),
      });
    }
    const group = mockModifierGroups.find(m => m.id === id);
    if (group) {
      // Update fields but preserve options from data if provided
      const updated = { 
        ...group, 
        ...data,
        updatedAt: new Date().toISOString(),
      };
      // Ensure options is set correctly
      if (data.options) {
        updated.options = data.options;
      }
      Object.assign(group, updated);
      if (logFullDataEnabled) {
        logger.info('[mock] RESPONSE', {
          feature: 'menu',
          op: 'modifier.update',
          data: samplePayload(updated, { allowKeys: menuAllowKeys }),
        });
      }
      return updated;
    }
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'modifier.delete',
        payload: samplePayload({ id }),
      });
    }
    const group = mockModifierGroups.find(m => m.id === id);
    if (group) {
      (group as any).active = false;
      group.updatedAt = new Date().toISOString();
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'modifier.delete',
        data: samplePayload({ success: true }),
      });
    }
    return { success: true };
  },
};

/**
 * Photos Mock
 */
export const menuPhotosMock = {
  async upload(itemId: string, data: { file: File }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'photo.upload',
        payload: samplePayload({ itemId, filename: data.file.name, size: data.file.size, type: data.file.type }),
      });
    }
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: URL.createObjectURL(data.file),
      filename: data.file.name,
      isPrimary: true,
      displayOrder: 0,
      size: data.file.size,
      mimeType: data.file.type,
      createdAt: new Date().toISOString(),
    };
    const item = mockMenuItems.find(i => i.id === itemId);
    if (item) {
      if (!item.photos) item.photos = [];
      // Set all others non-primary when adding primary
      item.photos.forEach(p => (p as any).isPrimary = false);
      item.photos.push(newPhoto as any);
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'photo.upload',
        data: samplePayload(newPhoto),
      });
    }
    return newPhoto;
  },
  async getPhotos(itemId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const item = mockMenuItems.find(i => i.id === itemId);
    return item?.photos || [];
  },
  async delete(itemId: string, photoId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'photo.delete',
        payload: samplePayload({ itemId, photoId }),
      });
    }
    const item = mockMenuItems.find(i => i.id === itemId);
    if (item?.photos) {
      item.photos = item.photos.filter(p => p.id !== photoId);
    }
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'photo.delete',
        data: samplePayload({ success: true }),
      });
    }
    return { success: true };
  },
  async setPrimary(itemId: string, photoId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'photo.setPrimary',
        payload: samplePayload({ itemId, photoId }),
      });
    }
    const item = mockMenuItems.find(i => i.id === itemId);
    if (!item?.photos) throw new Error(`Item ${itemId} not found`);
    item.photos.forEach(p => (p as any).isPrimary = p.id === photoId);
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'photo.setPrimary',
        data: samplePayload({ success: true }),
      });
    }
    return { success: true };
  },
  async bulkUpload(itemId: string, data: { files: File[] }) {
    await new Promise(resolve => setTimeout(resolve, 500 * data.files.length));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'photo.bulkUpload',
        payload: samplePayload({ itemId, fileCount: data.files.length, files: data.files.map(f => ({ filename: f.name, size: f.size, type: f.type })) }),
      });
    }
    const result = data.files.map((file, i) => ({
      id: `photo-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      filename: file.name,
      isPrimary: i === 0,
      displayOrder: i,
      size: file.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
    }));
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'photo.bulkUpload',
        data: samplePayload(result),
      });
    }
    return result;
  },
  async updateOrder(itemId: string, photoId: string, data: { displayOrder: number }) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (logFullDataEnabled) {
      logger.info('[mock] REQUEST', {
        feature: 'menu',
        op: 'photo.updateOrder',
        payload: samplePayload({ itemId, photoId, displayOrder: data.displayOrder }),
      });
    }
    const item = mockMenuItems.find(i => i.id === itemId);
    if (!item?.photos) throw new Error(`Item ${itemId} not found`);
    const photo = item.photos.find(p => p.id === photoId);
    if (photo) (photo as any).displayOrder = data.displayOrder;
    if (logFullDataEnabled) {
      logger.info('[mock] RESPONSE', {
        feature: 'menu',
        op: 'photo.updateOrder',
        data: samplePayload({ success: true }),
      });
    }
    return { success: true };
  },
};

// Unified mock
export const menuMock = {
  categories: menuCategoriesMock,
  items: menuItemsMock,
  modifiers: modifiersMock,
  photos: menuPhotosMock,
};
