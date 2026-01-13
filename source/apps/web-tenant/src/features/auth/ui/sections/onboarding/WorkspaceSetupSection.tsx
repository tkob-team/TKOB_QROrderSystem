import React from 'react';
import { Upload, Phone, MapPin, Globe, Palette } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import type { FormData } from './types';

type WorkspaceField = 'name' | 'slug' | 'description' | 'phone' | 'address' | 'language' | 'theme';

interface WorkspaceSetupSectionProps {
  formData: FormData;
  onFieldChange: (field: WorkspaceField, value: string) => void;
  onLogoUpload: () => void;
}

export function WorkspaceSetupSection({ formData, onFieldChange, onLogoUpload }: WorkspaceSetupSectionProps) {
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
            onChange={(e) => onFieldChange('phone', e.target.value)}
            placeholder="+1 234 567 8900"
          />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Globe className="w-4 h-4" />
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => onFieldChange('language', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 \
              focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 \
              transition-all duration-200 text-sm cursor-pointer"
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="th">ไทย (Thai)</option>
            <option value="zh">中文 (Chinese)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Palette className="w-4 h-4" />
            Theme
          </label>
          <select
            value={formData.theme}
            onChange={(e) => onFieldChange('theme', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 \
              focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 \
              transition-all duration-200 text-sm cursor-pointer"
          >
            <option value="emerald">Emerald (Green)</option>
            <option value="ocean">Ocean (Blue)</option>
            <option value="sunset">Sunset (Orange)</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Logo</label>
        {formData.logoUrl ? (
          <div className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <img 
              src={formData.logoUrl} 
              alt="Logo preview" 
              className="w-16 h-16 rounded-lg object-cover shadow-sm"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
              <p className="text-xs text-gray-500">Click to change</p>
            </div>
            <Button variant="secondary" onClick={onLogoUpload}>
              Change
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onLogoUpload}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg \
              hover:border-emerald-400 hover:bg-emerald-50/50 \
              transition-all duration-200 group"
          >
            <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-emerald-600">
              <Upload className="w-8 h-8" />
              <span className="text-sm font-medium">Click to upload logo</span>
              <span className="text-xs">(Simulated in demo)</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

export default WorkspaceSetupSection;
