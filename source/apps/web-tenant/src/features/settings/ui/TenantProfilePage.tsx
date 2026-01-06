'use client';

import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, Input, Button } from '@/shared/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@packages/ui';
import { Upload, Clock, Globe, Bell, Shield, CreditCard, Copy } from 'lucide-react';

type SettingsTab = 'profile' | 'hours' | 'payments' | 'notifications' | 'security';
type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type OpeningHoursDay = {
  enabled: boolean;
  openTime: string;
  closeTime: string;
};

const days: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function TenantProfilePage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile state
  const [restaurantName, setRestaurantName] = useState('TKOB Restaurant');
  const [urlSlug, setUrlSlug] = useState('tkob-restaurant');
  const [address, setAddress] = useState('123 Main Street, Downtown');
  const [phone, setPhone] = useState('+84 90 123 4567');
  const [email, setEmail] = useState('contact@tkqr.com');
  const [description, setDescription] = useState('Modern tkob serving fresh, locally-sourced dishes.');
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [theme, setTheme] = useState('emerald');
  const [timezone, setTimezone] = useState('UTC+7 (Bangkok, Hanoi)');
  const [logoPreview, setLogoPreview] = useState('TK');
  const [coverUploaded, setCoverUploaded] = useState(false);

  // Opening hours
  const [openingHours, setOpeningHours] = useState<Record<DayKey, OpeningHoursDay>>({
    monday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    tuesday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    wednesday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    thursday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    friday: { enabled: true, openTime: '09:00', closeTime: '22:00' },
    saturday: { enabled: true, openTime: '10:00', closeTime: '23:00' },
    sunday: { enabled: true, openTime: '10:00', closeTime: '21:00' },
  });
  const [sourceDay, setSourceDay] = useState<DayKey>('monday');

  // Payments
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [cashEnabled, setCashEnabled] = useState(true);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [staffNotifications, setStaffNotifications] = useState(false);

  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const slugPreview = useMemo(() => `https://tkqr.app/${urlSlug || 'your-restaurant'}`, [urlSlug]);

  const handleSaveProfile = () => {
    if (!restaurantName.trim()) {
      toast.error('Restaurant name is required');
      return;
    }
    toast.success('Profile saved');
  };

  const handleCopyHoursToAll = () => {
    const ref = openingHours[sourceDay];
    setOpeningHours((prev) => {
      const next = { ...prev };
      days.forEach((d) => {
        next[d] = { ...ref };
      });
      return next;
    });
    toast.success('Copied hours to all days');
  };

  const handleSaveHours = () => {
    toast.success('Opening hours saved');
  };

  const handleSavePayments = () => {
    toast.success('Payment settings saved');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved');
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings saved');
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-text-primary">Tenant Profile</h1>
        <p className="text-text-secondary text-sm">Manage restaurant info, hours, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-default">
        <div className="flex gap-2">
          {([
            ['profile', 'Profile'],
            ['hours', 'Opening Hours'],
            ['payments', 'Payments'],
            ['notifications', 'Notifications'],
            ['security', 'Security'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-3 relative text-sm font-semibold transition-colors ${
                activeTab === id ? 'text-accent-500' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {label}
              {activeTab === id && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-500" />}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && (
        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-elevated rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-text-secondary" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Restaurant Profile</h3>
                <p className="text-text-secondary text-sm">Public information shown to guests</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Restaurant Name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} required />
              <Input label="Slug" value={urlSlug} onChange={(e) => setUrlSlug(e.target.value)} helperText={slugPreview} />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} className="md:col-span-2" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-default rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                rows={4}
                placeholder="Tell guests about your restaurant"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Language</label>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className="px-4 py-3 border border-default rounded-lg bg-white text-text-primary"
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                  <option value="th">ไทย</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="px-4 py-3 border border-default rounded-lg bg-white text-text-primary"
                >
                  <option value="emerald">Emerald (Green)</option>
                  <option value="ocean">Ocean (Blue)</option>
                  <option value="sunset">Sunset (Orange)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  <option>UTC+7 (Bangkok, Hanoi)</option>
                  <option>UTC+8 (Singapore, Hong Kong)</option>
                  <option>UTC-5 (New York)</option>
                  <option>UTC+0 (London)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Logo</label>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 font-bold text-lg">
                    {logoPreview}
                  </div>
                  <div className="flex-1 text-sm text-gray-700">Logo upload is simulated in demo.</div>
                  <Button variant="secondary" onClick={() => { setLogoPreview('TK'); toast.success('Logo updated (demo)'); }}>
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900">Cover Image</label>
                <div className={`p-4 rounded-lg border ${coverUploaded ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5 text-gray-500" />
                      <div className="text-sm text-gray-700">
                        {coverUploaded ? 'Cover image uploaded' : 'Click upload to add a cover image'}
                      </div>
                    </div>
                    <Button variant="secondary" onClick={() => { setCoverUploaded(true); toast.success('Cover updated (demo)'); }}>
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => toast('Changes discarded')}>Cancel</Button>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'hours' && (
        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Opening Hours</h3>
                <p className="text-text-secondary text-sm">Configure daily schedules</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4 border border-default rounded-lg bg-elevated">
              <div className="flex flex-wrap items-center gap-3">
                <Copy className="w-5 h-5 text-text-tertiary" />
                <span className="text-sm text-text-secondary">Copy hours from</span>
                <select
                  value={sourceDay}
                  onChange={(e) => setSourceDay(e.target.value as DayKey)}
                  className="px-3 py-2 border border-default rounded-lg bg-white text-sm"
                >
                  {days.map((d) => (
                    <option key={d} value={d}>{dayLabels[d]}</option>
                  ))}
                </select>
                <Button variant="secondary" onClick={handleCopyHoursToAll}>Copy to all</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {days.map((day) => {
                const data = openingHours[day];
                return (
                  <div key={day} className="p-4 border border-default rounded-lg flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-primary">{dayLabels[day]}</span>
                      <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
                        <input
                          type="checkbox"
                          checked={data.enabled}
                          onChange={(e) => setOpeningHours((prev) => ({ ...prev, [day]: { ...data, enabled: e.target.checked } }))}
                          className="rounded border-default text-accent-500 focus:ring-accent-500"
                        />
                        Open
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={data.openTime}
                        onChange={(e) => setOpeningHours((prev) => ({ ...prev, [day]: { ...data, openTime: e.target.value } }))}
                        className="px-3 py-2 border border-default rounded-lg"
                        disabled={!data.enabled}
                      />
                      <input
                        type="time"
                        value={data.closeTime}
                        onChange={(e) => setOpeningHours((prev) => ({ ...prev, [day]: { ...data, closeTime: e.target.value } }))}
                        className="px-3 py-2 border border-default rounded-lg"
                        disabled={!data.enabled}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => toast('Changes discarded')}>Cancel</Button>
              <Button onClick={handleSaveHours}>Save Hours</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Payments</h3>
                <p className="text-text-secondary text-sm">Enable payment methods for guests</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 border border-default rounded-lg text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-default text-accent-500" checked={stripeEnabled} onChange={(e) => setStripeEnabled(e.target.checked)} />
                Stripe (card)
              </label>
              <label className="flex items-center gap-3 p-4 border border-default rounded-lg text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-default text-accent-500" checked={paypalEnabled} onChange={(e) => setPaypalEnabled(e.target.checked)} />
                PayPal
              </label>
              <label className="flex items-center gap-3 p-4 border border-default rounded-lg text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-default text-accent-500" checked={cashEnabled} onChange={(e) => setCashEnabled(e.target.checked)} />
                Cash
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => toast('Changes discarded')}>Cancel</Button>
              <Button onClick={handleSavePayments}>Save Payments</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Notifications</h3>
                <p className="text-text-secondary text-sm">Control which alerts you receive</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 border border-default rounded-lg text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-default text-accent-500" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                Email notifications
              </label>
              <label className="flex items-center gap-3 p-4 border border-default rounded-lg text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-default text-accent-500" checked={orderNotifications} onChange={(e) => setOrderNotifications(e.target.checked)} />
                Order updates
              </label>
              <label className="flex items-center gap-3 p-4 border border-default rounded-lg text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-default text-accent-500" checked={lowStockAlerts} onChange={(e) => setLowStockAlerts(e.target.checked)} />
                Low stock alerts
              </label>
              <label className="flex items-center gap-3 p-4 border border-default rounded-lg text-sm text-text-secondary">
                <input type="checkbox" className="rounded border-default text-accent-500" checked={staffNotifications} onChange={(e) => setStaffNotifications(e.target.checked)} />
                Staff notifications
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => toast('Changes discarded')}>Cancel</Button>
              <Button onClick={handleSaveNotifications}>Save Notifications</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-text-primary font-semibold">Security</h3>
                <p className="text-text-secondary text-sm">Control session and 2FA settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Session timeout (minutes)</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="px-4 py-3 border border-default rounded-lg bg-white text-text-primary"
                >
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="60">60</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-primary">Two-factor authentication</label>
                <div className="p-3 border border-default rounded-lg flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                  <Button variant="secondary" onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}>
                    {twoFactorEnabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => toast('Changes discarded')}>Cancel</Button>
              <Button onClick={handleSaveSecurity}>Save Security</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
