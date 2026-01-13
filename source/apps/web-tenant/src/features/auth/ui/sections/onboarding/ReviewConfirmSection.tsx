import React from 'react';
import { Store, Palette, Clock, Sparkles } from 'lucide-react';
import type { DayKey, FormData, OpeningHoursDay } from './types';

interface ReviewConfirmSectionProps {
  formData: FormData;
  enabledDays: DayKey[];
  openingHours: Record<DayKey, OpeningHoursDay>;
}

export function ReviewConfirmSection({ formData, enabledDays, openingHours }: ReviewConfirmSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <Sparkles className="w-6 h-6 text-emerald-600" />
        <div>
          <p className="font-medium text-emerald-800">Almost done!</p>
          <p className="text-sm text-emerald-700">Review your information and complete the setup.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            Restaurant Info
          </h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Name</span>
              <p className="font-medium text-gray-900">{formData.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-gray-500">Slug</span>
              <p className="font-medium text-gray-900">{formData.slug || 'Auto-generated'}</p>
            </div>
            {formData.phone && (
              <div>
                <span className="text-gray-500">Phone</span>
                <p className="font-medium text-gray-900">{formData.phone}</p>
              </div>
            )}
            {formData.address && (
              <div>
                <span className="text-gray-500">Address</span>
                <p className="font-medium text-gray-900">{formData.address}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600" />
            Settings
          </h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-500">Language</span>
              <p className="font-medium text-gray-900">
                {formData.language === 'en' && 'English'}
                {formData.language === 'vi' && 'Tiếng Việt'}
                {formData.language === 'th' && 'ไทย'}
                {formData.language === 'zh' && '中文'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Theme</span>
              <p className="font-medium text-gray-900">
                {formData.theme === 'emerald' && 'Emerald (Green)'}
                {formData.theme === 'ocean' && 'Ocean (Blue)'}
                {formData.theme === 'sunset' && 'Sunset (Orange)'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Logo</span>
              <p className="font-medium text-gray-900">
                {formData.logoUrl ? 'Uploaded' : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-gray-50 rounded-lg space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          Opening Hours
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {enabledDays.map((day) => {
            const hours = openingHours[day];
            return (
              <div key={day} className="flex justify-between p-2 bg-white rounded-lg">
                <span className="font-medium text-gray-900 capitalize">{day}</span>
                <span className="text-gray-600">{hours.openTime} - {hours.closeTime}</span>
              </div>
            );
          })}
        </div>
        
        {enabledDays.length === 0 && (
          <p className="text-sm text-gray-500">No operating days selected</p>
        )}
      </div>
    </div>
  );
}

export default ReviewConfirmSection;
