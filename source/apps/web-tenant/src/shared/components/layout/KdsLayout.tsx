import React from 'react';

/**
 * KDS Layout
 * 
 * Minimal layout for Kitchen Display System (KDS) screens.
 * Features:
 * - No sidebar or navigation chrome
 * - Full-screen view for kitchen displays
 * - Clean background optimized for visibility
 * - Designed for large display monitors in kitchen
 */

interface KdsLayoutProps {
  children: React.ReactNode;
  currentScreen?: string;
  onNavigate?: (screen: string) => void;
  activeItem?: string;
}

export function KdsLayout({ children }: KdsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
