/**
 * Menu Mock Adapter
 * Simulates API responses with fake delay and mock data
 */

import type { IMenuAdapter } from './types';
import { mockCategories, mockMenuItems, mockModifierGroups } from '@/services/mocks/menu-data';

/**
 * Simulate network delay (200-500ms)
 */
const fakeDelay = () => new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

export class MenuMockAdapter implements IMenuAdapter {
  // Categories
  async listCategories(params?: { activeOnly?: boolean }) {
    await fakeDelay();
    console.log('🎭 [MenuMockAdapter] Returning mock categories', { params });
    const filtered = params?.activeOnly ? mockCategories.filter((c) => c.active) : mockCategories;
    return {
      data: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 100,
        totalPages: 1,
      },
    };
  }

  async getCategoryById(id: string) {
    await fakeDelay();
    const category = mockCategories.find((c) => c.id === id);
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(data: any) {
    await fakeDelay();
    console.log('🎭 [MenuMockAdapter] Mock create category:', data);
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...data,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  }

  async updateCategory(id: string, data: any) {
    await fakeDelay();
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');
    mockCategories[index] = {
      ...mockCategories[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockCategories[index];
  }

  async deleteCategory(id: string) {
    await fakeDelay();
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index !== -1) {
      mockCategories.splice(index, 1);
    }
  }

  // Menu Items
  async listMenuItems(params?: { categoryId?: string; status?: string; available?: boolean; search?: string; chefRecommended?: boolean; sortBy?: string; sortOrder?: string }) {
    await fakeDelay();
    console.log('🎭 [MenuMockAdapter] Returning mock menu items', { params });
    
    let filtered = [...mockMenuItems];
    
    // Apply filters
    if (params?.categoryId) {
      filtered = filtered.filter((i) => i.categoryId === params.categoryId);
    }
    if (params?.status) {
      filtered = filtered.filter((i) => i.status === params.status);
    }
    if (params?.available !== undefined) {
      filtered = filtered.filter((i) => i.available === params.available);
    }
    if (params?.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter((i) => 
        i.name.toLowerCase().includes(query) || 
        (i.description || '').toLowerCase().includes(query)
      );
    }
    if (params?.chefRecommended) {
      filtered = filtered.filter((i) => i.chefRecommended === true);
    }
    
    // Apply sorting
    if (params?.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a: any, b: any) => {
        let aVal, bVal;
        switch (params.sortBy) {
          case 'popularity':
            aVal = a.popularity || 0;
            bVal = b.popularity || 0;
            break;
          case 'price':
            aVal = a.price || 0;
            bVal = b.price || 0;
            break;
          case 'name':
            aVal = a.name || '';
            bVal = b.name || '';
            return sortOrder * aVal.localeCompare(bVal);
          case 'createdAt':
          default:
            aVal = new Date(a.createdAt || 0).getTime();
            bVal = new Date(b.createdAt || 0).getTime();
            break;
        }
        return sortOrder * ((aVal as number) > (bVal as number) ? 1 : -1);
      });
    }
    
    return {
      data: filtered,
      meta: {
        total: filtered.length,
        page: 1,
        limit: 100,
        totalPages: 1,
      },
    };
  }

  async getMenuItemById(id: string) {
    await fakeDelay();
    const item = mockMenuItems.find((i) => i.id === id);
    if (!item) throw new Error('Menu item not found');
    return item;
  }

  async createMenuItem(data: any) {
    await fakeDelay();
    console.log('🎭 [MenuMockAdapter] Mock create menu item:', data);
    const newItem = {
      id: `item-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: mockCategories.find((c) => c.id === data.categoryId),
    };
    mockMenuItems.push(newItem);
    return newItem;
  }

  async updateMenuItem(id: string, data: any) {
    await fakeDelay();
    const index = mockMenuItems.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Menu item not found');
    mockMenuItems[index] = {
      ...mockMenuItems[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockMenuItems[index];
  }

  async deleteMenuItem(id: string) {
    await fakeDelay();
    const index = mockMenuItems.findIndex((i) => i.id === id);
    if (index !== -1) {
      mockMenuItems.splice(index, 1);
    }
  }

  async publishMenuItem(id: string, status: 'DRAFT' | 'PUBLISHED') {
    await fakeDelay();
    const index = mockMenuItems.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Menu item not found');
    mockMenuItems[index] = {
      ...mockMenuItems[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    return mockMenuItems[index];
  }

  // Modifier Groups
  async listModifierGroups(params?: { activeOnly?: boolean }) {
    await fakeDelay();
    console.log('🎭 [MenuMockAdapter] Returning mock modifier groups');
    
    let filtered = [...mockModifierGroups];
    if (params?.activeOnly) {
      filtered = filtered.filter((g) => g.active);
    }
    
    // Return array directly (not wrapped)
    return filtered;
  }

  async getModifierGroupById(id: string) {
    await fakeDelay();
    const group = mockModifierGroups.find((g) => g.id === id);
    if (!group) throw new Error('Modifier group not found');
    return group;
  }

  async createModifierGroup(data: any) {
    await fakeDelay();
    console.log('🎭 [MenuMockAdapter] Mock create modifier group:', data);
    const newGroup = {
      id: `mod-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockModifierGroups.push(newGroup);
    return newGroup;
  }

  async updateModifierGroup(id: string, data: any) {
    await fakeDelay();
    const index = mockModifierGroups.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Modifier group not found');
    mockModifierGroups[index] = {
      ...mockModifierGroups[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockModifierGroups[index];
  }

  async deleteModifierGroup(id: string) {
    await fakeDelay();
    const index = mockModifierGroups.findIndex((g) => g.id === id);
    if (index !== -1) {
      mockModifierGroups.splice(index, 1);
    }
  }
}
