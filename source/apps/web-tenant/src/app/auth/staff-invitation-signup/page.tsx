'use client';

import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function StaffInvitationSignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Invalid invitation link');
      return;
    }

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
    <div className="min-h-screen bg-linear-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Staff Invitation</h1>
          <p className="text-gray-600 text-sm">Complete your account setup</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            label="Email"
            value={email}
            disabled
            className="bg-gray-50"
          />

          <Input
            type="text"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
          />
          
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />

          <Button type="submit" disabled={isLoading} className="w-full mt-4">
            {isLoading ? 'Creating Account...' : 'Complete Setup'}
          </Button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              Back to Login
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
