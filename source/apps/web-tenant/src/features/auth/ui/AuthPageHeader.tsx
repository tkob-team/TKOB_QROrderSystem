/**
 * AuthPageHeader - Shared navigation header for all auth pages
 * Consistent emerald theme matching TopBar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react';

interface AuthPageHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function AuthPageHeader({
  showBackButton = true,
  backHref = '/home',
  backLabel = 'Back to Home',
}: AuthPageHeaderProps) {
  return (
    <header className="h-16 bg-emerald-600 text-white shadow-lg z-50 flex items-center px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        {/* Back Navigation */}
        {showBackButton && (
          <>
            <Link
              href={backHref}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>

            {/* Divider */}
            <div className="w-px h-8 bg-white/20" />
          </>
        )}

        {/* Brand */}
        <Link
          href="/home"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">
            TKOB
          </span>
        </Link>
      </div>
    </header>
  );
}

export default AuthPageHeader;
