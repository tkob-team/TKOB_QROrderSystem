import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { QrCode } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { authService } from './services';
import { toast } from 'sonner';
import "../../styles/globals.css";

interface ForgotPasswordProps {
  onNavigate?: (path: string) => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('EN');
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendLink = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.forgotPassword({ email });

      if (result.success) {
        setIsLinkSent(true);
        toast.success(result.message || 'Reset link sent');
      } else {
        toast.error(result.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('[ForgotPassword] Error:', error);
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col gap-8">
          {/* Logo & Title */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-gray-900">Forgot password?</h2>
              <p className="text-gray-600 text-center">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@restaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLinkSent || isLoading}
            />

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-blue-900" style={{ fontSize: '13px' }}>
                If your email exists in our system, you will receive an email with instructions.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleSendLink} 
              className="w-full"
              disabled={isLinkSent || isLoading || !email}
            >
              {isLoading ? 'Sending...' : isLinkSent ? 'Link sent ✓' : 'Send reset link'}
            </Button>
            
            {/* Show "Go to reset password" link after sending reset link */}
            {isLinkSent && (
              <div className="text-center">
                <button 
                  onClick={() => onNavigate?.(ROUTES.resetPassword)}
                  className="text-blue-600 hover:text-blue-700 transition-colors" 
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  Go to reset password →
                </button>
              </div>
            )}
            
            <div className="text-center">
              <button 
                onClick={() => onNavigate?.(ROUTES.login)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;
