/**
 * Menu Mock Adapter
 * Mock data for development/testing
 */

import type {
  MenuCategoryResponseDto,
  MenuItemResponseDto,
  ModifierGroupResponseDto,
} from '@/services/generated/models';

// Mock categories
const mockCategories: MenuCategoryResponseDto[] = [
  { 
    id: '1', 
    name: 'Starters', 
    displayOrder: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '2', 
    name: 'Main Courses', 
    displayOrder: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '3', 
    name: 'Desserts', 
    displayOrder: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: '4', 
    name: 'Beverages', 
    displayOrder: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock items
const mockItems: MenuItemResponseDto[] = [
  {
    id: '1',
    name: 'Caesar Salad',
    price: 12.5,
    description: 'Fresh romaine with parmesan',
    categoryId: '1',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Bruschetta',
    price: 9.0,
    description: 'Toasted bread with tomatoes',
    categoryId: '1',
    isAvailable: true,
  },
];

// Mock modifiers
const mockModifiers: ModifierGroupResponseDto[] = [
  {
    id: '1',
    name: 'Size',
    isRequired: true,
    modifiers: [
      { id: 'm1', name: 'Small', price: 0 },
      { id: 'm2', name: 'Medium', price: 2 },
      { id: 'm3', name: 'Large', price: 4 },
    ],
  },
];

/**
 * Menu Categories Mock
 */
export const menuCategoriesMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCategories;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { id: Date.now().toString(), ...data };
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
};

/**
 * Menu Items Mock
 */
export const menuItemsMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockItems;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { id: Date.now().toString(), ...data };
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
};

/**
 * Modifiers Mock
 */
export const modifiersMock = {
  async findAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockModifiers;
  },
  async create(data: any) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { id: Date.now().toString(), ...data };
  },
  async update(id: string, data: any) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id, ...data };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
  },
};

/**
 * Menu Photos Mock
 */
export const menuPhotosMock = {
  async upload(file: File) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { url: URL.createObjectURL(file), id: Date.now().toString() };
  },
  async delete(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
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
