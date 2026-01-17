'use client'

import { useState, useEffect } from 'react'
import { Home, ShoppingCart, ClipboardList, User } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useCart } from '@/shared/hooks/useCart'
import { colors, shadows, transitions } from '@/styles/design-tokens'

type Tab = 'menu' | 'cart' | 'orders' | 'profile'

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { itemCount } = useCart()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Hide BottomNav on menu item details page (Fix 01)
  const hideOnItemDetails = pathname.includes('/menu/') && pathname !== '/menu'
  
  // Hide BottomNav on checkout/payment flow routes (Fix 04)
  const hideOnCheckoutFlow = pathname === '/checkout' || pathname.startsWith('/payment')
  
  if (hideOnItemDetails || hideOnCheckoutFlow) {
    return null
  }
  
  // Determine active tab from pathname
  const getActiveTab = (): Tab => {
    if (pathname.startsWith('/cart')) return 'cart'
    if (pathname.startsWith('/orders')) return 'orders'
    if (pathname.startsWith('/profile')) return 'profile'
    return 'menu'
  }
  
  const activeTab = getActiveTab()
  const cartItemCount = itemCount
  
  const handleTabChange = (tab: Tab) => {
    router.push(`/${tab}`)
  }

  const tabs = [
    {
      id: 'menu' as Tab,
      label: 'Menu',
      icon: Home,
    },
    {
      id: 'cart' as Tab,
      label: 'Cart',
      icon: ShoppingCart,
      badge: cartItemCount,
    },
    {
      id: 'orders' as Tab,
      label: 'Orders',
      icon: ClipboardList,
    },
    {
      id: 'profile' as Tab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t safe-area-bottom"
      style={{ 
        borderColor: colors.border.DEFAULT,
        boxShadow: shadows.navBar,
      }}
    >
      <div className="max-w-[480px] mx-auto">
        <nav className="flex items-center justify-around px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg"
                style={{ 
                  minHeight: '56px',
                  transition: transitions.fast,
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[100];
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label={`Navigate to ${tab.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon 
                    className="w-6 h-6" 
                    style={{ 
                      color: isActive ? colors.primary[600] : colors.neutral[600],
                      strokeWidth: isActive ? 2.5 : 2,
                      transition: transitions.fast,
                    }} 
                  />
                  {mounted && tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-white"
                      style={{ 
                        backgroundColor: colors.accent[600],
                        fontSize: '11px',
                        lineHeight: '1',
                        fontWeight: '700',
                        boxShadow: shadows.badge,
                        animation: 'badge-pulse 2s ease-in-out infinite',
                      }}
                    >
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span 
                  style={{ 
                    color: isActive ? colors.primary[600] : colors.neutral[600],
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '400',
                    transition: transitions.fast,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        @keyframes badge-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
