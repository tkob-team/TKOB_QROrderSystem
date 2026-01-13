'use client';

import React from 'react';
import { Card, Button, Switch } from '@/shared/components';
import { Bell } from 'lucide-react';

export interface TenantNotificationsSectionProps {
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  staffNotifications: boolean;
  onEmailChange: (enabled: boolean) => void;
  onOrderChange: (enabled: boolean) => void;
  onStockChange: (enabled: boolean) => void;
  onStaffChange: (enabled: boolean) => void;
  onSave: () => void;
}

export function TenantNotificationsSection(props: TenantNotificationsSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
          <Bell className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Notifications</h3>
          <p className="text-text-secondary text-sm">Choose what notifications you receive</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">Email Notifications</p>
            <p className="text-sm text-text-secondary">Receive updates via email</p>
          </div>
          <Switch
            checked={props.emailNotifications}
            onChange={props.onEmailChange}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">Order Notifications</p>
            <p className="text-sm text-text-secondary">Get notified of new orders</p>
          </div>
          <Switch
            checked={props.orderNotifications}
            onChange={props.onOrderChange}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">Low Stock Alerts</p>
            <p className="text-sm text-text-secondary">Alert when items are running low</p>
          </div>
          <Switch
            checked={props.lowStockAlerts}
            onChange={props.onStockChange}
          />
        </div>
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div>
            <p className="font-semibold text-text-primary">Staff Notifications</p>
            <p className="text-sm text-text-secondary">Notify staff of updates</p>
          </div>
          <Switch
            checked={props.staffNotifications}
            onChange={props.onStaffChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={props.onSave}>Save Notifications</Button>
      </div>
    </Card>
  );
}
