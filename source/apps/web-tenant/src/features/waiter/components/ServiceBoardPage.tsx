"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Toast } from '@/shared/components/ui/Toast';
import { useAuth } from '@/shared/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Bell,
  BellOff,
  RefreshCw,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  Send,
  DollarSign,
  LogOut,
  Plus
} from 'lucide-react';

interface ServiceBoardPageProps {
  userRole?: 'admin' | 'waiter' | 'kds';
}

interface OrderItem {
  name: string;
  quantity: number;
  modifiers?: string[];
}

type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed';

type PaymentStatus = 'paid' | 'unpaid';

interface Order {
  id: string;
  orderNumber: string;
  table: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  placedTime: string;
  minutesAgo: number;
  total: number;
}

interface Tab {
  id: OrderStatus;
  label: string;
}

export function ServiceBoardPage({ userRole = 'waiter' }: ServiceBoardPageProps) {
  const router = useRouter();
  const { logout } = useAuth();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState<OrderStatus>('ready');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showRecentlyServed, setShowRecentlyServed] = useState(false);

  // Auto refresh - runs every 15 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval = setInterval(() => {
      // Silent refresh - no toast
      // In real app, this would fetch new data from API
    }, 15000); // 15 seconds

    return () => clearInterval(refreshInterval);
  }, [autoRefresh]);

  // Unified orders array with status field
  const [orders, setOrders] = useState<Order[]>([
    // Placed orders
    {
      id: '1',
      orderNumber: '#1250',
      table: 'Table 12',
      status: 'placed',
      paymentStatus: 'unpaid',
      placedTime: '1:15 PM',
      minutesAgo: 1,
      total: 45.50,
      items: [
        { name: 'Grilled Chicken Salad', quantity: 1, modifiers: ['Extra dressing', 'No croutons'] },
        { name: 'Coca Cola', quantity: 2 },
      ],
    },
    {
      id: '2',
      orderNumber: '#1251',
      table: 'Table 4',
      status: 'placed',
      paymentStatus: 'unpaid',
      placedTime: '1:14 PM',
      minutesAgo: 2,
      total: 68.00,
      items: [
        { name: 'Ribeye Steak', quantity: 1, modifiers: ['Medium rare', 'Garlic butter'] },
        { name: 'Mashed Potatoes', quantity: 1 },
        { name: 'Red Wine', quantity: 1, modifiers: ['House selection'] },
      ],
    },
    // Confirmed orders
    {
      id: '3',
      orderNumber: '#1248',
      table: 'Table 9',
      status: 'confirmed',
      paymentStatus: 'unpaid',
      placedTime: '1:10 PM',
      minutesAgo: 6,
      total: 32.50,
      items: [
        { name: 'Margherita Pizza', quantity: 1, modifiers: ['Thin crust', 'Extra basil'] },
        { name: 'Caesar Salad', quantity: 1 },
      ],
    },
    // Preparing orders
    {
      id: '4',
      orderNumber: '#1245',
      table: 'Table 5',
      status: 'preparing',
      paymentStatus: 'unpaid',
      placedTime: '1:00 PM',
      minutesAgo: 16,
      total: 89.00,
      items: [
        { name: 'Seafood Paella', quantity: 2, modifiers: ['Extra shrimp', 'No mussels'] },
        { name: 'Garlic Bread', quantity: 1 },
        { name: 'House Salad', quantity: 2, modifiers: ['Balsamic vinaigrette'] },
        { name: 'Sangria', quantity: 1, modifiers: ['Large pitcher'] },
      ],
    },
    {
      id: '5',
      orderNumber: '#1246',
      table: 'Table 7',
      status: 'preparing',
      paymentStatus: 'unpaid',
      placedTime: '1:05 PM',
      minutesAgo: 11,
      total: 56.50,
      items: [
        { name: 'Burger Deluxe', quantity: 2, modifiers: ['Medium', 'Extra cheese', 'No onions'] },
        { name: 'French Fries', quantity: 2, modifiers: ['Extra crispy'] },
        { name: 'Milkshake', quantity: 1, modifiers: ['Vanilla'] },
      ],
    },
    // Ready to serve orders
    {
      id: '6',
      orderNumber: '#1244',
      table: 'Table 3',
      status: 'ready',
      paymentStatus: 'unpaid',
      placedTime: '12:55 PM',
      minutesAgo: 5,
      total: 42.00,
      items: [
        { name: 'Pasta Carbonara', quantity: 1, modifiers: ['Extra bacon', 'Less cream'] },
        { name: 'Garden Salad', quantity: 1 },
        { name: 'Iced Tea', quantity: 1 },
      ],
    },
    {
      id: '7',
      orderNumber: '#1247',
      table: 'Table 2',
      status: 'ready',
      paymentStatus: 'unpaid',
      placedTime: '12:58 PM',
      minutesAgo: 2,
      total: 38.50,
      items: [
        { name: 'Grilled Salmon', quantity: 1, modifiers: ['Lemon butter sauce'] },
        { name: 'Steamed Vegetables', quantity: 1 },
      ],
    },
    // Completed orders
    {
      id: '8',
      orderNumber: '#1243',
      table: 'Table 8',
      status: 'completed',
      paymentStatus: 'paid',
      placedTime: '12:45 PM',
      minutesAgo: 15,
      total: 52.00,
      items: [
        { name: 'Fish & Chips', quantity: 1 },
        { name: 'Coleslaw', quantity: 1 },
      ],
    },
    {
      id: '9',
      orderNumber: '#1241',
      table: 'Table 1',
      status: 'completed',
      paymentStatus: 'unpaid',
      placedTime: '12:30 PM',
      minutesAgo: 28,
      total: 45.00,
      items: [
        { name: 'Chicken Wings', quantity: 1, modifiers: ['Spicy'] },
        { name: 'Onion Rings', quantity: 1 },
      ],
    },
    {
      id: '10',
      orderNumber: '#1242',
      table: 'Table 6',
      status: 'completed',
      paymentStatus: 'paid',
      placedTime: '12:35 PM',
      minutesAgo: 25,
      total: 36.00,
      items: [
        { name: 'Club Sandwich', quantity: 1 },
        { name: 'Sweet Potato Fries', quantity: 1 },
      ],
    },
  ]);

  const tabs: Tab[] = [
    { id: 'placed', label: 'Placed' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready to Serve' },
    { id: 'served', label: 'Served' },
    { id: 'completed', label: 'Completed' },
  ];

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  };

  const getTabCount = (status: OrderStatus) => {
    return getOrdersByStatus(status).length;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus, message: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    setToastMessage(message);
    setShowSuccessToast(true);
  };

  const handleAcceptOrder = (order: Order) => {
    updateOrderStatus(order.id, 'confirmed', `${order.orderNumber} accepted and sent to kitchen`);
  };

  const handleRejectOrder = (order: Order) => {
    updateOrderStatus(order.id, 'completed', `${order.orderNumber} rejected`);
  };

  const handleCancelOrder = (order: Order) => {
    updateOrderStatus(order.id, 'completed', `${order.orderNumber} cancelled`);
  };

  const handleMarkServed = (order: Order) => {
    updateOrderStatus(order.id, 'served', `${order.orderNumber} marked as served`);
  };

  const handleMarkCompleted = (order: Order) => {
    updateOrderStatus(order.id, 'completed', `${order.orderNumber} marked as completed`);
  };

  const handleMarkPaid = (order: Order) => {
    setOrders(orders.map(o => 
      o.id === order.id ? { ...o, paymentStatus: 'paid' } : o
    ));
    setToastMessage(`${order.orderNumber} payment marked as complete`);
    setShowSuccessToast(true);
  };

  const handleCloseTable = (order: Order) => {
    // In real app, this would close/clear the table
    setToastMessage(`${order.table} closed successfully`);
    setShowSuccessToast(true);
  };

  const toggleOrderExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleRefresh = () => {
    setToastMessage('Orders refreshed');
    setShowSuccessToast(true);
  };

  const handleManualOrder = () => {
    // Placeholder: In real app, this would open a modal or navigate to manual order creation
    setToastMessage('Manual order feature - Coming soon');
    setShowSuccessToast(true);
  };

  // Sort orders based on status
  const getSortedOrders = (status: OrderStatus) => {
    const filtered = getOrdersByStatus(status);
    
    // Completed: newest first (smallest minutesAgo first)
    if (status === 'completed') {
      return [...filtered].sort((a, b) => a.minutesAgo - b.minutesAgo);
    }
    
    // All other statuses: oldest first (highest minutesAgo first)
    return [...filtered].sort((a, b) => b.minutesAgo - a.minutesAgo);
  };

  const currentOrders = getSortedOrders(activeTab);
  const completedOrders = getSortedOrders('completed');

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Sticky & Compact */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 px-3 py-2">
          {/* Single Row: Title (left) + Controls (right) */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Title + Live Badge */}
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-gray-900 truncate" style={{ fontSize: '17px', fontWeight: 700 }}>
                Service Board
              </h1>
              {autoRefresh && (
                <Badge variant="success">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px]">Live</span>
                  </span>
                </Badge>
              )}
            </div>

            {/* Right: Icon-only Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Auto Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center justify-center w-11 h-11 border rounded-xl transition-all ${
                  autoRefresh
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 bg-white text-gray-700 active:bg-gray-100'
                }`}
                aria-label={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              </button>
              
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center justify-center w-11 h-11 border rounded-xl transition-all ${
                  soundEnabled
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 bg-white text-gray-700 active:bg-gray-100'
                }`}
                aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
              >
                {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              
              {/* Manual Refresh */}
              <button
                onClick={handleRefresh}
                className="flex items-center justify-center w-11 h-11 bg-white border border-gray-300 text-gray-700 rounded-xl active:bg-gray-100"
                aria-label="Refresh orders"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 700 }}>
                    Service Board
                  </h2>
                  {autoRefresh && (
                    <Badge variant="success">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Live
                      </span>
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600" style={{ fontSize: '14px' }}>
                  Manage orders from placement to service
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Auto/Live Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl transition-all ${
                  autoRefresh
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                style={{ fontSize: '14px', fontWeight: 600, minHeight: '40px' }}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                <span className="hidden sm:inline">{autoRefresh ? 'Live' : 'Auto'}</span>
              </button>
              
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded-xl transition-all ${
                  soundEnabled
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                style={{ fontSize: '14px', fontWeight: 600, minHeight: '40px' }}
              >
                {soundEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{soundEnabled ? 'Sound On' : 'Sound Off'}</span>
              </button>
              
              {/* Manual Refresh */}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-xl transition-all"
                style={{ fontSize: '14px', fontWeight: 600, minHeight: '40px' }}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              {/* Manual Order - Admin only, Desktop only */}
              {userRole === 'admin' && (
                <button
                  onClick={handleManualOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-xl transition-all"
                  style={{ fontSize: '14px', fontWeight: 600, minHeight: '40px' }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Manual Order</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Bar - Sticky */}
        <div className="sticky top-0 lg:top-0 z-10 bg-white border-b border-gray-200 shadow-sm" style={{ top: 'var(--mobile-header-height, 0px)' }}>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex px-4 lg:px-6 min-w-max lg:max-w-[1600px] lg:mx-auto">
              {tabs.map((tab) => {
                const count = getTabCount(tab.id);
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-emerald-500 text-emerald-700'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                    style={{ fontSize: '14px', fontWeight: isActive ? 700 : 600 }}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                        style={{ fontSize: '12px', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
              
              {/* Manual Order CTA - Waiter only */}
              {userRole === 'waiter' && (
                <button
                  onClick={handleManualOrder}
                  className="flex items-center gap-1.5 px-4 py-3 border-b-2 border-transparent transition-all whitespace-nowrap bg-emerald-50 hover:bg-emerald-100 text-emerald-700 ml-2 rounded-t-lg"
                  style={{ fontSize: '14px', fontWeight: 600 }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Manual</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-[1600px] mx-auto">
            {/* Orders Grid */}
            {currentOrders.length === 0 ? (
              <Card className="p-12 text-center" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 mb-2" style={{ fontSize: '18px', fontWeight: 600 }}>
                    No orders
                  </h4>
                  <p className="text-gray-600" style={{ fontSize: '15px' }}>
                    No {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} orders at the moment
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  
                  return (
                    <Card
                      key={order.id}
                      className={`p-5 transition-all hover:shadow-lg ${
                        activeTab === 'completed' ? 'opacity-75' : ''
                      }`}
                      style={{ 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        backgroundColor: activeTab === 'completed' ? '#F9FAFB' : 'white'
                      }}
                    >
                      <div className="flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-gray-900" style={{ fontSize: '18px', fontWeight: 700 }}>
                              {order.orderNumber}
                            </span>
                            <p className="text-gray-900 mt-0.5" style={{ fontSize: '16px', fontWeight: 600 }}>
                              {order.table}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                              ${order.total.toFixed(2)}
                            </span>
                            <div className="flex flex-col gap-1">
                              {activeTab === 'completed' && (
                                <Badge variant="neutral">
                                  <span style={{ fontSize: '11px' }}>Completed</span>
                                </Badge>
                              )}
                              {/* Payment Status Badge */}
                              <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                                <span style={{ fontSize: '11px' }}>
                                  {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Time Info */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <div className="flex-1">
                            <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 600 }}>
                              {order.minutesAgo} {order.minutesAgo === 1 ? 'minute' : 'minutes'} ago
                            </p>
                            <p className="text-gray-500" style={{ fontSize: '12px' }}>
                              {order.placedTime}
                            </p>
                          </div>
                        </div>

                        {/* Items List - Collapsible for Preparing tab */}
                        {activeTab === 'preparing' ? (
                          <>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Items ({order.items.length})
                                </p>
                              </div>
                              
                              {isExpanded && (
                                <div className="flex flex-col gap-2">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                                        {item.quantity}×
                                      </span>
                                      <div className="flex-1">
                                        <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 500 }}>
                                          {item.name}
                                        </p>
                                        {item.modifiers && item.modifiers.length > 0 && (
                                          <div className="flex flex-col gap-0.5 mt-0.5">
                                            {item.modifiers.map((modifier, modIndex) => (
                                              <div key={modIndex} className="flex items-center gap-1.5 text-gray-600">
                                                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                                <span style={{ fontSize: '11px', fontStyle: 'italic' }}>
                                                  {modifier}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-gray-700" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Items ({order.items.length})
                            </p>
                            <div className="flex flex-col gap-2">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 600 }}>
                                    {item.quantity}×
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-gray-900" style={{ fontSize: '13px', fontWeight: 500 }}>
                                      {item.name}
                                    </p>
                                    {item.modifiers && item.modifiers.length > 0 && (
                                      <div className="flex flex-col gap-0.5 mt-0.5">
                                        {item.modifiers.map((modifier, modIndex) => (
                                          <div key={modIndex} className="flex items-center gap-1.5 text-gray-600">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                            <span style={{ fontSize: '11px', fontStyle: 'italic' }}>
                                              {modifier}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions based on tab */}
                        {activeTab === 'placed' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleAcceptOrder(order)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl transition-all"
                              style={{ 
                                fontSize: '15px', 
                                fontWeight: 700,
                                minHeight: '48px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              <Send className="w-5 h-5" />
                              Accept & Send to Kitchen
                            </button>
                            <button
                              onClick={() => handleRejectOrder(order)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 border-2 border-red-500 text-red-600 rounded-xl transition-all"
                              style={{ 
                                fontSize: '15px', 
                                fontWeight: 700,
                                minHeight: '48px'
                              }}
                            >
                              <X className="w-5 h-5" />
                              Reject
                            </button>
                          </div>
                        )}

                        {activeTab === 'confirmed' && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-red-50 border-2 border-red-500 text-red-600 rounded-xl transition-all"
                            style={{ 
                              fontSize: '15px', 
                              fontWeight: 700,
                              minHeight: '48px'
                            }}
                          >
                            <X className="w-5 h-5" />
                            Cancel Order
                          </button>
                        )}

                        {activeTab === 'preparing' && (
                          <button
                            onClick={() => toggleOrderExpanded(order.id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl transition-all"
                            style={{ 
                              fontSize: '14px', 
                              fontWeight: 600,
                              minHeight: '40px'
                            }}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                View Details
                              </>
                            )}
                          </button>
                        )}

                        {activeTab === 'ready' && (
                          <button
                            onClick={() => handleMarkServed(order)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl transition-all"
                            style={{ 
                              fontSize: '15px', 
                              fontWeight: 700,
                              minHeight: '48px',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <CheckCircle className="w-5 h-5" />
                            Mark as Served
                          </button>
                        )}

                        {activeTab === 'served' && (
                          <button
                            onClick={() => handleMarkCompleted(order)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl transition-all"
                            style={{ 
                              fontSize: '15px', 
                              fontWeight: 700,
                              minHeight: '48px',
                              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}
                          >
                            <Check className="w-5 h-5" />
                            Mark as Completed
                          </button>
                        )}

                        {activeTab === 'completed' && (
                          <>
                            {order.paymentStatus === 'unpaid' && (
                              <button
                                onClick={() => handleMarkPaid(order)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl transition-all"
                                style={{ 
                                  fontSize: '15px', 
                                  fontWeight: 700,
                                  minHeight: '48px',
                                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                }}
                              >
                                <DollarSign className="w-5 h-5" />
                                Mark as Paid
                              </button>
                            )}
                            {order.paymentStatus === 'paid' && (
                              <button
                                onClick={() => handleCloseTable(order)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white rounded-xl transition-all"
                                style={{ 
                                  fontSize: '15px', 
                                  fontWeight: 700,
                                  minHeight: '48px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                }}
                              >
                                <LogOut className="w-5 h-5" />
                                Close Table
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Recently Served Section - Only on Completed tab */}
            {activeTab === 'completed' && completedOrders.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowRecentlyServed(!showRecentlyServed)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-gray-900" style={{ fontSize: '16px', fontWeight: 700 }}>
                        Recently Served
                      </h3>
                      <p className="text-gray-600" style={{ fontSize: '13px' }}>
                        {completedOrders.length} completed orders
                      </p>
                    </div>
                  </div>
                  {showRecentlyServed ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {showRecentlyServed && (
                  <Card className="mt-4 overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div className="divide-y divide-gray-200">
                      {completedOrders.map((order) => (
                        <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 700 }}>
                                    {order.orderNumber}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 600 }}>
                                    {order.table}
                                  </span>
                                </div>
                                <p className="text-gray-600" style={{ fontSize: '12px' }}>
                                  Served {order.minutesAgo} min ago • ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="neutral">
                              <span style={{ fontSize: '11px' }}>Done</span>
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showSuccessToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowSuccessToast(false)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
