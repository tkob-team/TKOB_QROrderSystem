/**
 * Marketing Layout
 * Layout for public pages (landing, about, help)
 * Does NOT include sidebar - uses MarketingHeader + Footer
 */

import { ReactNode } from 'react';
import { MarketingHeader } from '@/features/marketing/ui/MarketingHeader';
import { MarketingFooter } from '@/features/marketing/ui/MarketingFooter';

interface MarketingLayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
