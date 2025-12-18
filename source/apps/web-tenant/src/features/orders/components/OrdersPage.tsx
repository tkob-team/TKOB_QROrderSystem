'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Toast } from '@/shared/components/ui/Toast';
import { Modal } from '@/shared/components/ui/Modal';
import { 
  Search, 
  X, 
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check
} from 'lucide-react';

// Type definitions
type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
type PaymentStatus = 'paid' | 'unpaid' | 'refunded';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
}

interface Order {
  id: string;
  orderNumber: string;
  table: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  time: string;
  date: string;
  timeline: {
    placed?: string;
    confirmed?: string;
    preparing?: string;
    ready?: string;
    served?: string;
    completed?: string;
    cancelled?: string;
  };
}

interface ConfirmConfig {
  title: string;
  message: string;
  confirmText: string;
  confirmVariant: 'danger' | 'primary';
  onConfirm: () => void;
}

// Mock data
const initialOrders: Order[] = [
  {
    id: '1',
    orderNumber: '#1247',
    table: 'Table 9',
    time: '1:45 PM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Chicken Wings', quantity: 1, price: 14.00, modifiers: ['Buffalo sauce', 'Extra crispy'] },
      { name: 'Onion Rings', quantity: 1, price: 7.00 },
      { name: 'Lemonade', quantity: 2, price: 4.00 },
    ],
    subtotal: 29.00,
    tax: 2.90,
    total: 31.90,
    paymentStatus: 'unpaid',
    orderStatus: 'placed',
    timeline: { placed: '1:45 PM' },
  },
  {
    id: '2',
    orderNumber: '#1246',
    table: 'Table 12',
    time: '1:30 PM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Sushi Platter', quantity: 1, price: 35.00, modifiers: ['No wasabi'] },
      { name: 'Miso Soup', quantity: 2, price: 4.50 },
      { name: 'Green Tea', quantity: 2, price: 3.00 },
    ],
    subtotal: 50.00,
    tax: 5.00,
    total: 55.00,
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
    timeline: { placed: '1:30 PM', confirmed: '1:31 PM' },
  },
  {
    id: '3',
    orderNumber: '#1245',
    table: 'Table 5',
    time: '1:20 PM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Grilled Salmon', quantity: 1, price: 28.00 },
      { name: 'Steamed Vegetables', quantity: 1, price: 8.00 },
      { name: 'White Wine', quantity: 1, price: 12.00 },
    ],
    subtotal: 48.00,
    tax: 4.80,
    total: 52.80,
    paymentStatus: 'paid',
    orderStatus: 'ready',
    timeline: { placed: '1:20 PM', confirmed: '1:21 PM', preparing: '1:25 PM', ready: '1:45 PM' },
  },
  {
    id: '4',
    orderNumber: '#1244',
    table: 'Table 3',
    time: '12:45 PM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Margherita Pizza', quantity: 1, price: 16.00, modifiers: ['Extra cheese'] },
      { name: 'Caesar Salad', quantity: 1, price: 9.00 },
    ],
    subtotal: 25.00,
    tax: 2.50,
    total: 27.50,
    paymentStatus: 'paid',
    orderStatus: 'preparing',
    timeline: { placed: '12:45 PM', confirmed: '12:46 PM', preparing: '12:48 PM' },
  },
  {
    id: '5',
    orderNumber: '#1243',
    table: 'Table 8',
    time: '12:30 PM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Beef Burger', quantity: 2, price: 15.00, modifiers: ['No pickles'] },
      { name: 'French Fries', quantity: 2, price: 5.00 },
      { name: 'Milkshake', quantity: 1, price: 6.00 },
    ],
    subtotal: 46.00,
    tax: 4.60,
    total: 50.60,
    paymentStatus: 'paid',
    orderStatus: 'served',
    timeline: { placed: '12:30 PM', confirmed: '12:31 PM', preparing: '12:35 PM', ready: '12:48 PM', served: '1:00 PM' },
  },
  {
    id: '6',
    orderNumber: '#1242',
    table: 'Table 2',
    time: '12:05 PM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Pad Thai', quantity: 1, price: 18.00 },
      { name: 'Spring Rolls', quantity: 1, price: 8.00 },
      { name: 'Thai Iced Tea', quantity: 1, price: 4.00 },
    ],
    subtotal: 30.00,
    tax: 3.00,
    total: 33.00,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    timeline: { placed: '12:05 PM', confirmed: '12:06 PM', preparing: '12:10 PM', ready: '12:25 PM', completed: '12:35 PM' },
  },
  {
    id: '7',
    orderNumber: '#1241',
    table: 'Table 7',
    time: '11:35 AM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Pasta Carbonara', quantity: 2, price: 18.50, modifiers: ['Extra bacon'] },
      { name: 'Garlic Bread', quantity: 1, price: 6.00 },
    ],
    subtotal: 43.00,
    tax: 4.30,
    total: 47.30,
    paymentStatus: 'paid',
    orderStatus: 'completed',
    timeline: { placed: '11:35 AM', confirmed: '11:36 AM', preparing: '11:38 AM', ready: '11:58 AM', completed: '12:02 PM' },
  },
  {
    id: '8',
    orderNumber: '#1240',
    table: 'Table 6',
    time: '11:15 AM',
    date: 'Dec 8, 2024',
    items: [
      { name: 'Chicken Salad', quantity: 1, price: 14.00 },
      { name: 'Sparkling Water', quantity: 1, price: 3.50 },
    ],
    subtotal: 17.50,
    tax: 1.75,
    total: 19.25,
    paymentStatus: 'refunded',
    orderStatus: 'cancelled',
    timeline: { placed: '11:15 AM', cancelled: '11:20 AM' },
  },
];

export function OrdersPage() {
  // Orders state
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI state
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  
  // Toast
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Body scroll lock + ESC handler
  useEffect(() => {
    if (showDrawer) {
      document.body.style.overflow = 'hidden';
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseDrawer();
        }
      };
      
      document.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    }
  }, [showDrawer]);

  // Helper to get current time
  const getNowTime = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Open/close drawer
  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  // Navigate orders in drawer
  const handlePreviousOrder = () => {
    if (!selectedOrder) return;
    const currentIndex = filteredOrders.findIndex(o => o.id === selectedOrder.id);
    if (currentIndex > 0) {
      setSelectedOrder(filteredOrders[currentIndex - 1]);
    }
  };

  const handleNextOrder = () => {
    if (!selectedOrder) return;
    const currentIndex = filteredOrders.findIndex(o => o.id === selectedOrder.id);
    if (currentIndex < filteredOrders.length - 1) {
      setSelectedOrder(filteredOrders[currentIndex + 1]);
    }
  };

  // Confirm modal helpers
  const openConfirmModal = (config: ConfirmConfig) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmConfig(null);
  };

  // Handler: Accept Order (placed → confirmed)
  const handleAcceptOrder = () => {
    if (!selectedOrder || selectedOrder.orderStatus !== 'placed') return;
    
    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          orderStatus: 'confirmed' as OrderStatus,
          timeline: {
            ...order.timeline,
            confirmed: getNowTime()
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    const updated = updatedOrders.find(o => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
    
    setToastMessage(`Order ${selectedOrder.orderNumber} accepted and sent to kitchen`);
    setShowSuccessToast(true);
  };

  // Handler: Reject Order (placed → cancelled)
  const handleRejectOrderConfirmed = () => {
    if (!selectedOrder || selectedOrder.orderStatus !== 'placed') return;
    
    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          orderStatus: 'cancelled' as OrderStatus,
          timeline: {
            ...order.timeline,
            cancelled: getNowTime()
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    const updated = updatedOrders.find(o => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
    
    closeConfirmModal();
    setToastMessage(`Order ${selectedOrder.orderNumber} rejected`);
    setShowSuccessToast(true);
  };

  // Handler: Cancel Order (confirmed → cancelled)
  const handleCancelOrderConfirmed = () => {
    if (!selectedOrder || selectedOrder.orderStatus !== 'confirmed') return;
    
    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          orderStatus: 'cancelled' as OrderStatus,
          timeline: {
            ...order.timeline,
            cancelled: getNowTime()
          }
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    const updated = updatedOrders.find(o => o.id === selectedOrder.id);
    if (updated) setSelectedOrder(updated);
    
    closeConfirmModal();
    setToastMessage(`Order ${selectedOrder.orderNumber} cancelled`);
    setShowSuccessToast(true);
  };

  // Open reject confirmation
  const handleRejectOrder = () => {
    if (!selectedOrder) return;
    openConfirmModal({
      title: `Reject Order ${selectedOrder.orderNumber}?`,
      message: 'This will cancel the order and it will not be processed.',
      confirmText: 'Reject',
      confirmVariant: 'danger',
      onConfirm: handleRejectOrderConfirmed
    });
  };

  // Open cancel confirmation
  const handleCancelOrder = () => {
    if (!selectedOrder) return;
    openConfirmModal({
      title: `Cancel Order ${selectedOrder.orderNumber}?`,
      message: 'Use this when the customer cancels verbally or items are unavailable.',
      confirmText: 'Cancel Order',
      confirmVariant: 'danger',
      onConfirm: handleCancelOrderConfirmed
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Date filter (simplified for demo)
    if (dateFilter !== 'all' && dateFilter !== 'today') return false;
    
    // Status filter
    if (statusFilter !== 'all' && order.orderStatus !== statusFilter) return false;
    
    // Table filter
    if (tableFilter !== 'all' && order.table !== tableFilter) return false;
    
    // Search filter
    if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !order.table.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Active filters
  const activeFilters = [];
  if (dateFilter !== 'all') activeFilters.push({ key: 'date', label: dateFilter === 'today' ? 'Today' : dateFilter });
  if (statusFilter !== 'all') activeFilters.push({ key: 'status', label: statusFilter });
  if (tableFilter !== 'all') activeFilters.push({ key: 'table', label: tableFilter });
  if (searchQuery) activeFilters.push({ key: 'search', label: `"${searchQuery}"` });

  const removeFilter = (key: string) => {
    if (key === 'date') setDateFilter('all');
    if (key === 'status') setStatusFilter('all');
    if (key === 'table') setTableFilter('all');
    if (key === 'search') setSearchQuery('');
  };

  const clearAllFilters = () => {
    setDateFilter('all');
    setStatusFilter('all');
    setTableFilter('all');
    setSearchQuery('');
  };

  // Status config helper
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return { variant: 'neutral' as const, label: 'Placed', color: 'border-gray-500' };
      case 'confirmed':
        return { variant: 'info' as const, label: 'Confirmed', color: 'border-blue-500' };
      case 'preparing':
        return { variant: 'warning' as const, label: 'Preparing', color: 'border-amber-500' };
      case 'ready':
        return { variant: 'info' as const, label: 'Ready', color: 'border-emerald-500' };
      case 'served':
        return { variant: 'success' as const, label: 'Served', color: 'border-gray-400' };
      case 'completed':
        return { variant: 'success' as const, label: 'Completed', color: 'border-gray-400' };
      case 'cancelled':
        return { variant: 'error' as const, label: 'Cancelled', color: 'border-red-500' };
      default:
        return { variant: 'neutral' as const, label: 'Unknown', color: 'border-gray-300' };
    }
  };

  // Payment badge helper
  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'unpaid':
        return <Badge variant="error">Unpaid</Badge>;
      case 'refunded':
        return <Badge variant="neutral">Refunded</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  // Navigation availability
  const currentIndex = selectedOrder ? filteredOrders.findIndex(o => o.id === selectedOrder.id) : -1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < filteredOrders.length - 1;

  return (
    <>
      <div className="flex flex-col px-6 pt-6 pb-5">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 -mx-6 -mt-6 mb-6 px-6 py-5">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-gray-900" style={{ fontSize: '28px', fontWeight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' }}>
                  Orders
                </h2>
                <p className="text-gray-600 mt-1" style={{ fontSize: '15px' }}>
                  View and manage all restaurant orders
                </p>
              </div>
            </div>

            {/* Toolbar: Search + Filters */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders by ID or table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                  style={{ fontSize: '14px', borderRadius: '12px', height: '42px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2.5">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-300 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                  style={{ fontSize: '14px', fontWeight: 500, borderRadius: '12px', height: '42px', minWidth: '140px' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="served">Served</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select 
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-300 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                  style={{ fontSize: '14px', fontWeight: 500, borderRadius: '12px', height: '42px', minWidth: '140px' }}
                >
                  <option value="all">All Tables</option>
                  <option value="Table 2">Table 2</option>
                  <option value="Table 3">Table 3</option>
                  <option value="Table 5">Table 5</option>
                  <option value="Table 6">Table 6</option>
                  <option value="Table 7">Table 7</option>
                  <option value="Table 8">Table 8</option>
                  <option value="Table 9">Table 9</option>
                  <option value="Table 12">Table 12</option>
                </select>

                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3.5 py-2.5 border border-gray-300 bg-white text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
                  style={{ fontSize: '14px', fontWeight: 500, borderRadius: '12px', height: '42px', minWidth: '140px' }}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>

            {/* Applied Filters */}
            {activeFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Filters:
                </span>
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => removeFilter(filter.key)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 600, borderRadius: '9999px' }}
                  >
                    {filter.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  style={{ fontSize: '12px', fontWeight: 600 }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order List */}
        <div className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-gray-200" style={{ borderRadius: '16px' }}>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-gray-900 mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>
                No orders found
              </h4>
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              {filteredOrders.map((order, index) => {
                const statusConfig = getStatusConfig(order.orderStatus);
                const isSelected = selectedOrder?.id === order.id && showDrawer;
                
                return (
                  <div
                    key={order.id}
                    onClick={() => handleOpenDrawer(order)}
                    className={`p-5 cursor-pointer transition-all relative ${
                      index !== filteredOrders.length - 1 ? 'border-b border-gray-200' : ''
                    } ${
                      isSelected 
                        ? 'bg-emerald-50 border-l-4 border-l-emerald-500' 
                        : `hover:bg-gray-50 border-l-4 ${statusConfig.color}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-6">
                      {/* Left: Order Info */}
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                            {order.orderNumber}
                          </span>
                          <span className="text-gray-600" style={{ fontSize: '14px' }}>
                            {order.table}
                          </span>
                        </div>
                        
                        <span className="text-gray-500" style={{ fontSize: '13px' }}>
                          {order.time}
                        </span>

                        <span className="text-gray-600" style={{ fontSize: '14px' }}>
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Right: Status, Payment, Total */}
                      <div className="flex items-center gap-4">
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                        
                        {getPaymentBadge(order.paymentStatus)}
                        
                        <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Detail Drawer */}
        {showDrawer && selectedOrder && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40 animate-fade-in"
              onClick={handleCloseDrawer}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                transition: 'opacity 0.3s'
              }}
            />
            
            {/* Drawer */}
            <div 
              className="fixed top-0 right-0 h-full bg-white z-50 flex flex-col animate-slide-in-right"
              style={{ 
                width: '45%',
                maxWidth: '800px',
                minWidth: '500px',
                boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-4">
                  <h3 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <div className="flex gap-2">
                    <Badge variant={getStatusConfig(selectedOrder.orderStatus).variant}>
                      {getStatusConfig(selectedOrder.orderStatus).label}
                    </Badge>
                    {getPaymentBadge(selectedOrder.paymentStatus)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous/Next */}
                  <button
                    onClick={handlePreviousOrder}
                    disabled={!canGoPrevious}
                    className={`p-2 transition-all ${
                      canGoPrevious 
                        ? 'hover:bg-gray-100 text-gray-700' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    style={{ borderRadius: '8px' }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={handleNextOrder}
                    disabled={!canGoNext}
                    className={`p-2 transition-all ${
                      canGoNext 
                        ? 'hover:bg-gray-100 text-gray-700' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    style={{ borderRadius: '8px' }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Close */}
                  <button
                    onClick={handleCloseDrawer}
                    className="p-2 hover:bg-gray-100 transition-colors ml-2"
                    style={{ borderRadius: '8px' }}
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="flex flex-col gap-6">
                  {/* Order Info + Timeline */}
                  <Card className="p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-gray-600" style={{ fontSize: '15px' }}>
                        {selectedOrder.table}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600" style={{ fontSize: '15px' }}>
                        {selectedOrder.date} at {selectedOrder.time}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="pt-4 border-t border-gray-200">
                      {selectedOrder.orderStatus === 'cancelled' ? (
                        <div className="text-center py-4">
                          <Badge variant="error">Order Cancelled</Badge>
                          <p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>
                            This order has been cancelled and will not be processed
                          </p>
                          {selectedOrder.timeline.cancelled && (
                            <p className="text-gray-400 mt-1" style={{ fontSize: '12px' }}>
                              Cancelled at {selectedOrder.timeline.cancelled}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between relative">
                          {/* Progress Line */}
                          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                            <div 
                              className="h-full bg-emerald-500 transition-all"
                              style={{ 
                                width: selectedOrder.timeline.completed ? '100%' : 
                                       selectedOrder.timeline.ready ? '75%' : 
                                       selectedOrder.timeline.preparing ? '50%' : 
                                       selectedOrder.timeline.confirmed ? '25%' :
                                       selectedOrder.timeline.placed ? '0%' : '0%'
                              }}
                            />
                          </div>

                          {/* Steps */}
                          {['placed', 'confirmed', 'preparing', 'ready', 'completed'].map((step) => {
                            const isActive = selectedOrder.timeline[step as keyof typeof selectedOrder.timeline];
                            const stepLabels = {
                              placed: 'Placed',
                              confirmed: 'Confirmed',
                              preparing: 'Preparing',
                              ready: 'Ready',
                              completed: 'Done'
                            };
                            
                            return (
                              <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                                <div 
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isActive 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-gray-200 text-gray-400'
                                  }`}
                                  style={{ boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none' }}
                                >
                                  {isActive && (
                                    <Check className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="text-center">
                                  <p className={`${isActive ? 'text-gray-900' : 'text-gray-500'}`} style={{ fontSize: '12px', fontWeight: 600 }}>
                                    {stepLabels[step as keyof typeof stepLabels]}
                                  </p>
                                  {isActive && (
                                    <p className="text-gray-500" style={{ fontSize: '11px' }}>
                                      {selectedOrder.timeline[step as keyof typeof selectedOrder.timeline]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Items List */}
                  <Card className="p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h4 className="text-gray-900 mb-4" style={{ fontSize: '18px', fontWeight: 700 }}>
                      Order Items
                    </h4>
                    <div className="flex flex-col gap-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-start justify-between pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                            {item.modifiers && item.modifiers.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.modifiers.map((mod, idx) => (
                                  <span key={idx} className="text-gray-500 text-xs px-2 py-0.5 bg-gray-100 rounded">
                                    {mod}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-gray-900" style={{ fontSize: '15px', fontWeight: 600 }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600" style={{ fontSize: '14px' }}>Subtotal</span>
                        <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                          ${selectedOrder.subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600" style={{ fontSize: '14px' }}>Tax</span>
                        <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                          ${selectedOrder.tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>Total</span>
                        <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                          ${selectedOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  {selectedOrder.orderStatus === 'placed' && (
                    <div className="flex gap-3">
                      <button
                        onClick={handleAcceptOrder}
                        className="flex-1 px-4 py-3 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px' }}
                      >
                        Accept & Send to Kitchen
                      </button>
                      <button
                        onClick={handleRejectOrder}
                        className="flex-1 px-4 py-3 bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 transition-colors"
                        style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px' }}
                      >
                        Reject Order
                      </button>
                    </div>
                  )}

                  {selectedOrder.orderStatus === 'confirmed' && (
                    <button
                      onClick={handleCancelOrder}
                      className="w-full px-4 py-3 bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 transition-colors"
                      style={{ fontSize: '15px', fontWeight: 600, borderRadius: '12px' }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast */}
      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      {/* Confirm Modal */}
      {showConfirmModal && confirmConfig && (
        <Modal
          isOpen={showConfirmModal}
          onClose={closeConfirmModal}
          title={confirmConfig.title}
          size="md"
          footer={
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ fontSize: '14px', fontWeight: 600, borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmConfig.onConfirm}
                className={`px-4 py-2 text-white transition-colors ${
                  confirmConfig.confirmVariant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                style={{ fontSize: '14px', fontWeight: 600, borderRadius: '10px' }}
              >
                {confirmConfig.confirmText}
              </button>
            </div>
          }
        >
          <p className="text-gray-600" style={{ fontSize: '14px' }}>
            {confirmConfig.message}
          </p>
        </Modal>
      )}

      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
