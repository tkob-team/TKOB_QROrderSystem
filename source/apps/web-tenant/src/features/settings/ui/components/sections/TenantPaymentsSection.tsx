'use client';

import React from 'react';
import { Card, Button, Switch } from '@/shared/components';
import { CreditCard } from 'lucide-react';

export interface TenantPaymentsSectionProps {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  cashEnabled: boolean;
  onStripeChange: (enabled: boolean) => void;
  onPaypalChange: (enabled: boolean) => void;
  onCashChange: (enabled: boolean) => void;
  onSave: () => void;
}

export function TenantPaymentsSection(props: TenantPaymentsSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Payment Methods</h3>
          <p className="text-text-secondary text-sm">Enable payment options for your customers</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">Stripe</p>
            <p className="text-sm text-text-secondary">Accept card payments</p>
          </div>
          <Switch
            checked={props.stripeEnabled}
            onChange={props.onStripeChange}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">PayPal</p>
            <p className="text-sm text-text-secondary">Accept PayPal payments</p>
          </div>
          <Switch
            checked={props.paypalEnabled}
            onChange={props.onPaypalChange}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">Cash</p>
            <p className="text-sm text-text-secondary">Accept cash payments on pickup</p>
          </div>
          <Switch
            checked={props.cashEnabled}
            onChange={props.onCashChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={props.onSave}>Save Payments</Button>
      </div>
    </Card>
  );
}
