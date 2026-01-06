'use client';

import { Card, Button, Input } from '@/shared/components';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import { QrCode, Shield, CheckCircle } from 'lucide-react';

function StaffInvitationSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'mike@tkob.com';
  const token = searchParams.get('token') || '';
  const role = searchParams.get('role') || 'Kitchen Staff';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Simple password strength calculation
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-amber-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Account created successfully!');
      router.push('/auth/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <span className="font-semibold text-gray-900" style={{ fontSize: '20px' }}>
            TKQR
          </span>
        </div>
      </div>

      <Card className="w-full max-w-md p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-gray-900">Join TKOB Restaurant</h2>
              <p className="text-gray-600">
                You&apos;ve been invited to join as a{' '}
                <span style={{ fontWeight: 600 }}>{role}</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Email Display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600" style={{ fontSize: '13px' }}>
                  Email
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-gray-900" style={{ fontSize: '14px', fontWeight: 500 }}>
                {email}
              </span>
            </div>

            {/* Password Input with Strength Indicator */}
            <div className="flex flex-col gap-2">
              <Input
                label="Create Password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              {password && (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          level <= passwordStrength ? getStrengthColor() : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600" style={{ fontSize: '13px' }}>
                    Password strength:{' '}
                    <span style={{ fontWeight: 500 }}>{getStrengthText()}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {/* Password Requirements */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-900" style={{ fontSize: '13px' }}>
                Password requirements:
              </p>
              <ul className="mt-2 ml-4 text-blue-800" style={{ fontSize: '13px' }}>
                <li className="list-disc">At least 8 characters</li>
                <li className="list-disc">Mix of uppercase and lowercase</li>
                <li className="list-disc">Include numbers and symbols</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!password || !confirmPassword || password !== confirmPassword || isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating Account...' : 'Create account & join restaurant'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function StaffInvitationSignupPage() {
  return (
    <Suspense>
      <StaffInvitationSignupContent />
    </Suspense>
  );
}
