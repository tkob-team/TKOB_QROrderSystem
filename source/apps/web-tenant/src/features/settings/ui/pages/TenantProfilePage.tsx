'use client';

import React from 'react';
import { useTenantProfileController } from '../../hooks';
import {
  TenantOpeningHoursSection,
  TenantPaymentsSection,
  TenantPromotionsSection,
} from '../components/sections';
import { SubscriptionSettingsPage } from './SubscriptionSettingsPage';
import type { TenantProfileTab } from '../../model';


export function TenantProfilePage() {
  const controller = useTenantProfileController();

  const tabLabels: Record<TenantProfileTab, string> = {
    hours: 'Opening Hours',
    payments: 'Payments',
    promotions: 'Promotions',
    subscription: 'Subscription',
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary">Setting Tenant</h1>
        <p className="text-text-secondary text-sm">Manage your restaurant information and settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-default">
        <div className="flex gap-2 overflow-x-auto">
          {(['hours', 'payments', 'promotions', 'subscription'] as TenantProfileTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => controller.setActiveTab(tab)}
              className={`px-4 py-3 relative text-sm font-semibold transition-colors whitespace-nowrap ${
                controller.activeTab === tab ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tabLabels[tab]}
              {controller.activeTab === tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Hours Tab */}
      {controller.activeTab === 'hours' && (
        <TenantOpeningHoursSection
          openingHours={controller.openingHours}
          sourceDay={controller.sourceDay}
          onSourceDayChange={controller.setSourceDay}
          onHoursChange={controller.setOpeningHours}
          onCopyToAll={controller.handleCopyHoursToAll}
          onSave={controller.handleSaveHours}
        />
      )}

      {/* Payments Tab */}
      {controller.activeTab === 'payments' && (
        <TenantPaymentsSection />
      )}

      {/* Promotions Tab */}
      {controller.activeTab === 'promotions' && (
        <TenantPromotionsSection />
      )}

      {/* Subscription Tab */}
      {controller.activeTab === 'subscription' && (
        <SubscriptionSettingsPage />
      )}
    </div>
  );
}
