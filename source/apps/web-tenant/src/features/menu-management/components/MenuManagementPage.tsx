'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useAppRouter } from '@/shared/hooks/useAppRouter';
import { ROUTES } from '@/lib/routes';
import { Toast } from '@/shared/components/ui/Toast'
// Full featured Menu Management (ported from Admin-screens) without layout shell
export function MenuManagementPage() {
  const { goTo } = useAppRouter();

  const [selectedCategory, setSelectedCategory] = useState('starters');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategories, setNewCategories] = useState<Array<{ id: string; name: string; itemCount: number }>>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'add' | 'edit'>('add');
  const [currentEditItemId, setCurrentEditItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'starters',
    description: '',
    price: '',
    available: true,
    image: null as File | null,
  });

  const baseCategories = [
    { id: 'starters', name: 'Starters', itemCount: 8 },
    { id: 'mains', name: 'Main Courses', itemCount: 15 },
    { id: 'desserts', name: 'Desserts', itemCount: 6 },
    { id: 'drinks', name: 'Drinks', itemCount: 12 },
  ];
  const categories = [...baseCategories, ...newCategories];

  const initialMenuItems = [
    { id: '1', name: 'Caesar Salad', price: '$12.50', status: 'available', description: 'Fresh romaine with parmesan', category: 'starters' },
    { id: '2', name: 'Bruschetta', price: '$9.00', status: 'available', description: 'Toasted bread with tomatoes', category: 'starters' },
    { id: '3', name: 'Spring Rolls', price: '$8.50', status: 'unavailable', description: 'Crispy vegetable rolls', category: 'starters' },
    { id: '4', name: 'Garlic Bread', price: '$6.00', status: 'available', description: 'Toasted with garlic butter', category: 'starters' },
    { id: '5', name: 'Grilled Chicken', price: '$24.00', status: 'available', description: 'Herb-marinated chicken breast', category: 'mains' },
    { id: '6', name: 'Spaghetti Carbonara', price: '$18.50', status: 'available', description: 'Classic Italian pasta with bacon', category: 'mains' },
    { id: '7', name: 'Steak & Fries', price: '$32.00', status: 'available', description: 'Premium ribeye with crispy fries', category: 'mains' },
    { id: '8', name: 'Salmon Fillet', price: '$28.00', status: 'unavailable', description: 'Pan-seared Atlantic salmon', category: 'mains' },
    { id: '9', name: 'Chocolate Cake', price: '$8.50', status: 'available', description: 'Rich chocolate layer cake', category: 'desserts' },
    { id: '10', name: 'Ice Cream', price: '$6.00', status: 'available', description: 'Vanilla, chocolate, or strawberry', category: 'desserts' },
    { id: '11', name: 'Tiramisu', price: '$9.50', status: 'available', description: 'Classic Italian coffee dessert', category: 'desserts' },
    { id: '12', name: 'Cheesecake', price: '$8.00', status: 'unavailable', description: 'New York style cheesecake', category: 'desserts' },
    { id: '13', name: 'Cola', price: '$3.50', status: 'available', description: 'Chilled Coca-Cola', category: 'drinks' },
    { id: '14', name: 'Orange Juice', price: '$4.50', status: 'available', description: 'Freshly squeezed orange juice', category: 'drinks' },
    { id: '15', name: 'Hot Coffee', price: '$3.00', status: 'available', description: 'Espresso or Americano', category: 'drinks' },
    { id: '16', name: 'Iced Tea', price: '$3.50', status: 'available', description: 'Refreshing lemon iced tea', category: 'drinks' },
  ];
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [newlyAddedItemId, setNewlyAddedItemId] = useState<string | null>(null);

  const visibleMenuItems = menuItems
    .filter(item => !deletedItemIds.includes(item.id))
    .filter(item => item.category === selectedCategory);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        name: newCategoryName,
        itemCount: 0,
      };
      setNewCategories([...newCategories, newCategory]);
      setSelectedCategory(newCategory.id);
      setIsAddCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
      setToastMessage(`Category "${newCategoryName}" created successfully`);
      setShowSuccessToast(true);
    }
  };

  const handleOpenAddItemModal = () => {
    setItemModalMode('add');
    setItemFormData({ name: '', category: selectedCategory, description: '', price: '', available: true, image: null });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setItemModalMode('edit');
    setCurrentEditItemId(item.id);
    setItemFormData({
      name: item.name,
      category: item.category || selectedCategory,
      description: item.description,
      price: item.price.replace('$', ''),
      available: item.status === 'available',
      image: null,
    });
    setIsItemModalOpen(true);
  };

  const handleCloseItemModal = () => {
    setIsItemModalOpen(false);
    setCurrentEditItemId(null);
    setItemFormData({ name: '', category: 'starters', description: '', price: '', available: true, image: null });
  };

  const handleSaveItem = () => {
    if (itemFormData.name.trim() && itemFormData.price.trim()) {
      if (itemModalMode === 'add') {
        const newItem = {
          id: `new-${Date.now()}`,
          name: itemFormData.name,
          price: `$${parseFloat(itemFormData.price).toFixed(2)}`,
          status: itemFormData.available ? 'available' : 'unavailable',
          description: itemFormData.description || 'No description',
          category: itemFormData.category,
        };
        setMenuItems([...menuItems, newItem]);
        setEditingItem(newItem.id);
        setNewlyAddedItemId(newItem.id);
        setTimeout(() => setNewlyAddedItemId(null), 3000);
        setToastMessage(`Item "${itemFormData.name}" created successfully`);
      } else {
        const updatedItems = menuItems.map(item => item.id === currentEditItemId
          ? { ...item, name: itemFormData.name, price: `$${parseFloat(itemFormData.price).toFixed(2)}`, status: itemFormData.available ? 'available' : 'unavailable', description: itemFormData.description || item.description, category: itemFormData.category }
          : item);
        setMenuItems(updatedItems);
        setToastMessage(`Item "${itemFormData.name}" updated successfully`);
      }
      setShowSuccessToast(true);
      handleCloseItemModal();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setItemFormData({ ...itemFormData, image: e.target.files[0] });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setEditingItem(null);
    setIsAddingNewItem(false);
    setHasUploadedImage(false);
  };

  const handleItemClick = (itemId: string) => {
    setEditingItem(itemId);
    setIsAddingNewItem(false);
    setHasUploadedImage(false);
  };

  const handleDeleteClick = (e: React.MouseEvent, item: { id: string; name: string }) => {
    e.stopPropagation();
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setIsDeleteModalOpen(false);
      setIsDeleting(true);
      setTimeout(() => {
        setDeletedItemIds([...deletedItemIds, itemToDelete.id]);
        if (editingItem === itemToDelete.id) {
          setEditingItem(null);
          setIsAddingNewItem(false);
        }
        setIsDeleting(false);
        setItemToDelete(null);
      }, 1200);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Menu Management</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => goTo(ROUTES.menuModifiers)}>Modifiers</Button>
          <Button onClick={handleOpenAddItemModal}>
            <Plus className="w-4 h-4 mr-2" />Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* Categories */}
        <div className="col-span-3">
          <Card className="p-4 flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Categories</h3>
              <button className="p-2 hover:bg-emerald-50 rounded-lg" onClick={() => setIsAddCategoryModalOpen(true)}>
                <Plus className="w-4 h-4 text-emerald-500" />
              </button>
            </div>
            <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
              {categories.map(category => {
                const isActive = selectedCategory === category.id;
                const categoryItemCount = menuItems.filter(item => item.category === category.id && !deletedItemIds.includes(item.id)).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${isActive ? 'bg-emerald-200 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{categoryItemCount}</span>
                  </button>
                );
              })}
            </div>
            <div className="pt-4 border-t border-gray-200 mt-4">
              <Button variant="secondary" className="w-full" onClick={() => setIsAddCategoryModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />Add Category
              </Button>
            </div>
          </Card>
        </div>

        {/* Items */}
        <div className="col-span-5">
          <Card className="p-6 flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Items</h3>
              {isDeleting && <span className="text-sm text-gray-500">Updating...</span>}
            </div>
            <div className="flex-1 overflow-y-auto">
              <div key={selectedCategory} className="flex flex-col gap-3">
                {isDeleting ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                      <div className="h-5 bg-gray-200 rounded w-16" />
                    </div>
                  ))
                ) : visibleMenuItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-gray-900 mb-2 text-base font-semibold">No items in {categories.find(c => c.id === selectedCategory)?.name}</h4>
                    <p className="text-gray-600 mb-4 text-sm">Add your first item to this category</p>
                    <Button onClick={handleOpenAddItemModal}>
                      <Plus className="w-4 h-4 mr-2" />Add Item
                    </Button>
                  </div>
                ) : (
                  visibleMenuItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${editingItem === item.id ? 'border-emerald-500 bg-emerald-50' : item.id === newlyAddedItemId ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                            {item.id === newlyAddedItemId && (
                              <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold">NEW</span>
                            )}
                            <Badge variant={item.status === 'available' ? 'success' : 'neutral'}>
                              {item.status === 'available' ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-xs mb-2">{item.description}</p>
                          <span className="text-emerald-600 text-sm font-semibold">{item.price}</span>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-emerald-50 rounded-full"
                            onClick={(e) => handleOpenEditItemModal(e, item)}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-50 rounded-full"
                            onClick={(e) => handleDeleteClick(e, item)}
                          >
                            <Trash2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleOpenAddItemModal}>
                <Plus className="w-4 h-4 mr-2" />Add Item
              </Button>
            </div>
          </Card>
        </div>

        {/* Detail */}
        <div className="col-span-4">
          <Card className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
            {editingItem ? (() => {
              const selectedItem = visibleMenuItems.find(it => it.id === editingItem);
              if (!selectedItem) return null;
              return (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900">Item Details</h3>
                    <button className="text-emerald-500 text-sm font-medium hover:text-emerald-600" onClick={() => goTo(ROUTES.menuModifiers)}>
                      Manage Modifiers →
                    </button>
                  </div>
                  <div className="p-6 bg-linear-to-br from-emerald-50 to-white rounded-xl border-2 border-emerald-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{selectedItem.name}</h4>
                        <Badge variant={selectedItem.status === 'available' ? 'success' : 'neutral'}>
                          {selectedItem.status === 'available' ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                      <div className="text-emerald-600 text-xl font-bold">{selectedItem.price}</div>
                    </div>
                    <p className="text-sm text-gray-600">{selectedItem.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[11px] text-gray-600 mb-1">Category</p>
                      <p className="text-sm font-semibold text-gray-900">{categories.find(c => c.id === selectedCategory)?.name}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[11px] text-gray-600 mb-1">Status</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedItem.status === 'available' ? 'In Stock' : 'Out of Stock'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                    <Button onClick={(e) => handleOpenEditItemModal(e as any, selectedItem)}>Edit Item</Button>
                    <Button variant="secondary" onClick={() => setEditingItem(null)}>Deselect</Button>
                  </div>
                </div>
              );
            })() : isAddingNewItem ? (
              <div className="flex flex-col gap-6">
                <h3 className="text-gray-900">Add New Item</h3>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-900">Item Image</label>
                  {hasUploadedImage ? (
                    <div className="border-2 border-emerald-500 rounded-xl p-6 flex flex-col items-center gap-3 bg-emerald-50">
                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                        <ImageIcon className="w-12 h-12 text-emerald-500" />
                      </div>
                      <button onClick={() => setHasUploadedImage(false)} className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Change image</button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-emerald-500 cursor-pointer" onClick={() => setHasUploadedImage(true)}>
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">Upload image</p>
                      <p className="text-xs text-gray-600">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
                <Input label="Name" value={itemFormData.name} placeholder="Item name" onChange={e => setItemFormData({ ...itemFormData, name: e.target.value })} />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-900">Description</label>
                  <textarea className="px-4 py-3 border border-gray-300 rounded-xl text-sm" rows={3} value={itemFormData.description} onChange={e => setItemFormData({ ...itemFormData, description: e.target.value })} />
                </div>
                <Input label="Base Price" type="number" value={itemFormData.price} placeholder="0.00" onChange={e => setItemFormData({ ...itemFormData, price: e.target.value })} />
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-900">Category</label>
                  <select className="px-4 py-3 border border-gray-300 rounded-xl text-sm" value={itemFormData.category} onChange={e => setItemFormData({ ...itemFormData, category: e.target.value })}>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Available</p>
                    <p className="text-xs text-gray-600">Item is visible to customers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={itemFormData.available} onChange={e => setItemFormData({ ...itemFormData, available: e.target.checked })} />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer-focus:ring-emerald-300 peer-checked:bg-emerald-500 relative">
                      <div className="absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-full" />
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button onClick={handleSaveItem} disabled={!itemFormData.name || !itemFormData.price}>Create item</Button>
                  <Button variant="secondary" onClick={() => { setEditingItem(null); setIsAddingNewItem(false); setHasUploadedImage(false); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Edit className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900">No item selected</h3>
                <p className="text-sm text-gray-600">Select an item from the list to edit its details</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(16px)' }} onClick={() => { setIsAddCategoryModalOpen(false); setNewCategoryName(''); setNewCategoryDescription(''); }}>
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Add Category</h3>
              <button onClick={() => { setIsAddCategoryModalOpen(false); setNewCategoryName(''); setNewCategoryDescription(''); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Category name *</label>
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g., Specials" className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Description (optional)</label>
                <textarea value={newCategoryDescription} onChange={e => setNewCategoryDescription(e.target.value)} placeholder="Add a brief description..." className="px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500" rows={3} />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button onClick={() => { setIsAddCategoryModalOpen(false); setNewCategoryName(''); setNewCategoryDescription(''); }} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed">Create Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(18px)' }} onClick={handleCloseItemModal}>
          <div className="bg-white w-full mx-4 rounded-2xl shadow-2xl" style={{ maxWidth: '560px', maxHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{itemModalMode === 'add' ? 'Create New Item' : 'Edit Item'}</h3>
              <button onClick={handleCloseItemModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 flex flex-col gap-5 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Item Name *</label>
                <input type="text" value={itemFormData.name} onChange={e => setItemFormData({ ...itemFormData, name: e.target.value })} placeholder="e.g., Caesar Salad" className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Category *</label>
                <select value={itemFormData.category} onChange={e => setItemFormData({ ...itemFormData, category: e.target.value })} className="px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Description</label>
                <textarea value={itemFormData.description} onChange={e => setItemFormData({ ...itemFormData, description: e.target.value })} placeholder="Describe your dish..." className="px-4 py-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:border-emerald-500" rows={3} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
                  <input type="number" value={itemFormData.price} onChange={e => setItemFormData({ ...itemFormData, price: e.target.value })} placeholder="0.00" step="0.01" min="0" className="w-full pl-7 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Available to customers</p>
                  <p className="text-xs text-gray-600">Toggle to make this item {itemFormData.available ? 'unavailable' : 'available'}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only" checked={itemFormData.available} onChange={e => setItemFormData({ ...itemFormData, available: e.target.checked })} />
                  <div className="w-11 h-6 bg-gray-200 peer-checked:bg-emerald-500 rounded-full relative">
                    <div className="absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform peer-checked:translate-x-full" />
                  </div>
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Item Image</label>
                {itemFormData.image ? (
                  <div className="border-2 border-emerald-500 rounded-xl p-6 flex flex-col items-center gap-3 bg-emerald-50">
                    <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center overflow-hidden"><ImageIcon className="w-12 h-12 text-emerald-500" /></div>
                    <p className="text-sm font-semibold text-emerald-700">{itemFormData.image.name}</p>
                    <p className="text-xs text-emerald-600">{(itemFormData.image.size / 1024).toFixed(1)} KB</p>
                    <button onClick={() => setItemFormData({ ...itemFormData, image: null })} className="text-emerald-600 text-sm font-medium hover:text-emerald-700">Remove image</button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center"><Upload className="w-8 h-8 text-gray-400" /></div>
                    <p className="text-sm font-semibold text-gray-900">Drop image or click to upload</p>
                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (max. 5MB)</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button variant="secondary" className="flex-1" onClick={handleCloseItemModal}>Cancel</Button>
              <Button className="flex-1" onClick={handleSaveItem} disabled={!itemFormData.name.trim() || !itemFormData.price.trim()}>Save Item</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(16px)' }} onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}>
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Delete menu item?</h3>
              <button onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{itemToDelete.name}</span> will be removed from your menu. You can add it again later.</p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <Button variant="secondary" className="flex-1" onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}>Cancel</Button>
              <Button className="flex-1" onClick={handleConfirmDelete} variant="destructive">Delete item</Button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <Toast message={toastMessage} type="success" onClose={() => setShowSuccessToast(false)} />
      )}
    </div>
  );
}
