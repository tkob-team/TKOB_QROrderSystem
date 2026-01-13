/**
 * Action and Button Configuration
 * Defines order action buttons and styling by status
 */

import {
  Send,
  X,
  Check,
  CheckCircle,
  DollarSign,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * Action Button Configuration by Order Status
 */
export const ORDER_ACTION_CONFIG = {
  placed: {
    primary: {
      label: 'Accept & Send to Kitchen',
      icon: Send,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    secondary: {
      label: 'Reject',
      icon: X,
      className: 'bg-white hover:bg-red-50 border-2 border-red-500 text-red-600',
      shadow: 'none',
    },
  },
  confirmed: {
    primary: {
      label: 'Cancel Order',
      icon: X,
      className: 'bg-white hover:bg-red-50 border-2 border-red-500 text-red-600',
      shadow: 'none',
    },
  },
  preparing: {
    primary: {
      label: 'View Details',
      iconExpanded: ChevronUp,
      iconCollapsed: ChevronDown,
      className: 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700',
      shadow: 'none',
      minHeight: '40px',
    },
  },
  ready: {
    primary: {
      label: 'Mark as Served',
      icon: CheckCircle,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
  },
  served: {
    primary: {
      label: 'Mark as Completed',
      icon: Check,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
  },
  completed: {
    unpaid: {
      label: 'Mark as Paid',
      icon: DollarSign,
      className: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
      shadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
    paid: {
      label: 'Close Table',
      icon: LogOut,
      className: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
};

/**
 * Touch-friendly button height standard
 */
export const BUTTON_HEIGHT = {
  primary: '48px', // Main action buttons (48px for touch)
  secondary: '40px', // Secondary actions
};
