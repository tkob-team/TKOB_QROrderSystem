import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { QrCode } from 'lucide-react';
import "../../styles/globals.css";
interface SignupProps {
  onNavigate?: (screen: string) => void;
}

export function Signup({ onNavigate }: SignupProps) {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [language, setLanguage] = useState('EN');

  const handleSignup = () => {
    onNavigate?.('email-verification');
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
            <Button 
              onClick={handleSignup} 
              className="w-full" 
              disabled={!agreedToTerms}
            >
              Create account
            </Button>            <div className="text-center">
              <span className="text-gray-600" style={{ fontSize: '14px' }}>
                Already have an account?{' '}
              </span>
              <button 
                onClick={() => onNavigate?.('login')}
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
