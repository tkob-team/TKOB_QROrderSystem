'use client';

import React from 'react';
import { Card, Input, Button } from '@/shared/components';
import { Store } from 'lucide-react';

export interface TenantBasicInfoSectionProps {
  restaurantName: string;
  urlSlug: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  onRestaurantNameChange: (value: string) => void;
  onUrlSlugChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
}

export function TenantBasicInfoSection(props: TenantBasicInfoSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Store className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Basic Information</h3>
          <p className="text-text-secondary text-sm">Your restaurant&apos;s core details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Restaurant Name"
          value={props.restaurantName}
          onChange={(e) => props.onRestaurantNameChange(e.target.value)}
          placeholder="Your restaurant name"
          required
        />
        <Input
          label="URL Slug"
          value={props.urlSlug}
          onChange={(e) => props.onUrlSlugChange(e.target.value)}
          placeholder="your-restaurant"
          required
        />
        <Input
          label="Address"
          value={props.address}
          onChange={(e) => props.onAddressChange(e.target.value)}
          placeholder="Street address"
        />
        <Input
          label="Phone"
          value={props.phone}
          onChange={(e) => props.onPhoneChange(e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="mt-4">
        <Input
          label="Email"
          value={props.email}
          onChange={(e) => props.onEmailChange(e.target.value)}
          placeholder="contact@restaurant.com"
        />
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-text-primary mb-2 block">Description</label>
        <textarea
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
          placeholder="Tell customers about your restaurant"
          rows={4}
          className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
        />
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
        <Button variant="secondary">Cancel</Button>
        <Button onClick={props.onSave}>Save Changes</Button>
      </div>
    </Card>
  );
}
