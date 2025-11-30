import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { QrCode } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import "../../styles/globals.css";
interface LoginProps {
  onNavigate?: (screen: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [language, setLanguage] = useState('EN');
  const { devLogin } = useAuth();

  const handleLogin = () => {
    onNavigate?.('/admin/dashboard');
  };

  const handleDevLogin = (role: 'admin' | 'kds' | 'waiter') => {
    devLogin(role);
    // Navigate based on role
    if (role === 'admin') {
      onNavigate?.('/admin/dashboard');
    } else if (role === 'kds') {
      onNavigate?.('/admin/kds');
    } else if (role === 'waiter') {
      onNavigate?.('/admin/service-board');
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
              <h2 className="text-gray-900">TKQR</h2>
              <p className="text-gray-600">Sign in to your restaurant dashboard</p>
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
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-600" style={{ fontSize: '14px' }}>Remember me</span>
              </label>
              
              <button 
                onClick={() => onNavigate?.('/forgot-password')}
                className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <Button onClick={handleLogin} className="w-full">
              Log in
            </Button>            <div className="text-center">
              <span className="text-gray-600" style={{ fontSize: '14px' }}>
                Don&apos;t have an account?{' '}
              </span>
              <button 
                onClick={() => onNavigate?.('/signup')}
                className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Dev mode shortcuts */}
          <div className="flex flex-col gap-3">
            <p className="text-gray-500 text-center" style={{ fontSize: '12px' }}>
              Dev mode (for developers only – remove in production)
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDevLogin('admin')}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-500 transition-all"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                🔐 Login as Admin
              </button>
              
              <button
                onClick={() => handleDevLogin('kds')}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 transition-all"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                👨‍🍳 Login as KDS
              </button>
              
              <button
                onClick={() => handleDevLogin('waiter')}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-500 transition-all"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                🧑‍💼 Login as Waiter
              </button>
              
              <button
                onClick={() => onNavigate?.('/staff-invitation')}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-500 transition-all"
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                ✉️ Staff Invitation
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Login;
