import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAnimation } from '@/shared/hooks';

interface DetailDrawerProps {
  /**
   * Drawer open state
   */
  isOpen: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Drawer title
   */
  title: string;
  /**
   * Optional subtitle
   */
  subtitle?: string;
  /**
   * Header actions (e.g., Edit, Delete buttons)
   */
  headerActions?: React.ReactNode;
  /**
   * Main content body
   */
  children: React.ReactNode;
  /**
   * Footer actions (e.g., Save, Cancel buttons)
   */
  footer?: React.ReactNode;
  /**
   * Drawer width
   */
  width?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const WIDTH_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

/**
 * DetailDrawer Pattern
 * 
 * Side panel drawer for viewing/editing details.
 * Alternative to Modal when showing detailed information.
 * 
 * Reuses existing Modal backdrop logic, positions content on right side.
 * 
 * @example
 * <DetailDrawer
 *   isOpen={showOrderDetails}
 *   onClose={() => setShowOrderDetails(false)}
 *   title={`Order #${order.number}`}
 *   subtitle={`Table ${order.table}`}
 *   headerActions={<Button size="sm">Edit</Button>}
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={handleCancel}>Cancel</Button>
 *       <Button onClick={handleComplete}>Mark Complete</Button>
 *     </>
 *   }
 * >
 *   <OrderDetailsContent order={order} />
 * </DetailDrawer>
 */
export function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  headerActions,
  children,
  footer,
  width = 'lg',
  className = '',
}: DetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { scaleIn } = useAnimation();

  useEffect(() => {
    if (isOpen && drawerRef.current) {
      scaleIn({ targets: drawerRef.current, duration: 300 });
    }
  }, [isOpen, scaleIn]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`
          fixed top-0 right-0 bottom-0 z-50
          bg-white shadow-2xl
          w-full ${WIDTH_CLASSES[width]}
          flex flex-col
          animate-slide-in-right
          opacity-0
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {headerActions}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer (if provided) */}
        {footer && (
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-end gap-3">
              {footer}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* Add animation to globals.css if not exists */
// @keyframes slide-in-right {
//   from {
//     transform: translateX(100%);
//   }
//   to {
//     transform: translateX(0);
//   }
// }
//
// .animate-slide-in-right {
//   animation: slide-in-right 0.3s ease-out;
// }
//
// @keyframes fade-in {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
//
// .animate-fade-in {
//   animation: fade-in 0.2s ease-out;
// }
