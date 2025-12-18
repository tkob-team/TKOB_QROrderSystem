import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { ROUTES } from '@/lib/routes';
import "../../styles/globals.css";

interface SignupProps {
  onNavigate?: (screen: string) => void;
}

export function Signup({ onNavigate }: SignupProps) {
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [language, setLanguage] = useState('EN');

  // Generate slug from restaurant name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Validate slug format
  const validateSlug = (value: string): boolean => {
    if (value === '') return true; // Empty is valid (will auto-generate)
    const slugPattern = /^[a-z0-9-]+$/;
    return slugPattern.test(value);
  };

  // Handle slug input change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase(); // Force lowercase
    setSlug(value);
    
    if (value && !validateSlug(value)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens.');
    } else {
      setSlugError('');
    }
  };

  // Check slug availability (demo)
  const handleCheckAvailability = () => {
    const effectiveSlug = slug || generateSlug(restaurantName);
    if (!effectiveSlug) {
      toast.error('Please enter a restaurant name or slug first');
      return;
    }
    toast.success('✅ Looks available (demo)');
  };

  // Get effective slug for preview
  const getEffectiveSlug = (): string => {
    if (slug) return slug;
    if (restaurantName) return generateSlug(restaurantName);
    return '';
  };

  const handleSignup = () => {
    // Validate slug before submission
    if (slug && !validateSlug(slug)) {
      return; // Don't submit if slug is invalid
    }

    // Include slug in form data (auto-generate if empty)
    const effectiveSlug = slug || generateSlug(restaurantName);
    console.log('Signup data:', {
      tenantName: restaurantName,
      slug: effectiveSlug,
      email,
      password,
    });

    onNavigate?.(ROUTES.emailVerification);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {/* Language selector */}
      <div className="absolute top-8 right-8">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl bg-white text-gray-900 cursor-pointer focus:outline-none focus:border-emerald-500"
        >
          <option>EN</option>
          <option>VI</option>
        </select>
      </div>

      <Card className="w-full max-w-md p-8 shadow-md">
        <div className="flex flex-col gap-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Create your account</h2>
              <p className="text-gray-600">Start managing your restaurant today</p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Input
              label="Restaurant Name"
              type="text"
              placeholder="Your Restaurant Name"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
            />

            {/* Restaurant Slug Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700" style={{ fontSize: '14px', fontWeight: 600 }}>
                  Restaurant Slug (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. the-bistro"
                    value={slug}
                    onChange={handleSlugChange}
                    className={`flex-1 h-12 px-4 border ${
                      slugError ? 'border-red-500' : 'border-gray-300'
                    } rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors`}
                    style={{ fontSize: '15px' }}
                  />
                  <button
                    type="button"
                    onClick={handleCheckAvailability}
                    className="px-4 py-2 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Check
                  </button>
                </div>
              </div>
              
              {/* Helper text */}
              <p className="text-gray-500" style={{ fontSize: '12px' }}>
                This will be used in your restaurant URL. Leave empty to auto-generate from the restaurant name.
              </p>
              
              {/* URL Preview */}
              {getEffectiveSlug() && (
                <div className="text-gray-600" style={{ fontSize: '14px' }}>
                  Preview: <span className="text-emerald-600">{getEffectiveSlug()}.qrdine.com</span>
                  {!slug && <span className="text-gray-400"> (auto)</span>}
                </div>
              )}
              
              {/* Validation error */}
              {slugError && (
                <p className="text-red-600" style={{ fontSize: '12px' }}>
                  {slugError}
                </p>
              )}
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="admin@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-1 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="text-gray-600" style={{ fontSize: '14px' }}>
                I agree to the{' '}
                <button className="text-emerald-500 hover:text-emerald-600 transition-colors" style={{ fontWeight: 500 }}>
                  Terms and Conditions
                </button>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button onClick={handleSignup} className="w-full" disabled={!agreedToTerms}>
              Create account
            </Button>
            
            <div className="text-center">
              <span className="text-gray-600" style={{ fontSize: '14px' }}>
                Already have an account?{' '}
              </span>
              <button 
                onClick={() => onNavigate?.(ROUTES.login)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Signup;
