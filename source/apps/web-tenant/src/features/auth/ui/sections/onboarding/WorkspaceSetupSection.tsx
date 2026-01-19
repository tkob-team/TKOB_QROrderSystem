import React, { useState } from 'react';
import { Phone, MapPin, AlertCircle } from 'lucide-react';
import { Input } from '@/shared/components/Input';
import type { FormData } from './types';

type WorkspaceField = 'name' | 'slug' | 'description' | 'phone' | 'address';

interface WorkspaceSetupSectionProps {
  formData: FormData;
  onFieldChange: (field: WorkspaceField, value: string) => void;
}

// Phone validation: 10-15 digits, optional + prefix, spaces/dashes allowed
const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true; // Empty is valid (optional field)
  // Remove all spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  // Must be: optional +, then 10-15 digits
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(cleaned);
};

export function WorkspaceSetupSection({ formData, onFieldChange }: WorkspaceSetupSectionProps) {
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handlePhoneChange = (value: string) => {
    onFieldChange('phone', value);
    
    // Validate on change
    if (value.trim() && !validatePhone(value)) {
      setPhoneError('Invalid phone format. Use 10-15 digits with optional + prefix.');
    } else {
      setPhoneError(null);
    }
  };
  return (
    <div className="space-y-5">
      <Input
        label="Restaurant Name"
        value={formData.name}
        onChange={(e) => onFieldChange('name', e.target.value)}
        placeholder="My Restaurant"
        required
      />
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
        <Input
          value={formData.slug}
          onChange={(e) => onFieldChange('slug', e.target.value)}
          placeholder="my-restaurant"
        />
        <p className="text-xs text-gray-500">
          Used in URLs. Leave empty to auto-generate.
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Tell us about your restaurant..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 \
            resize-y focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 \
            transition-all duration-200 text-sm"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone className="w-4 h-4" />
            Phone
          </label>
          <Input
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+84 123 456 789"
            className={phoneError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
          />
          {phoneError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{phoneError}</span>
            </div>
          )}
          <p className="text-xs text-gray-500">Example: +84912345678 or 0912 345 678</p>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4" />
            Address
          </label>
          <Input
            value={formData.address}
            onChange={(e) => onFieldChange('address', e.target.value)}
            placeholder="123 Main Street"
          />
        </div>
      </div>
    </div>
  );
}

export default WorkspaceSetupSection;
