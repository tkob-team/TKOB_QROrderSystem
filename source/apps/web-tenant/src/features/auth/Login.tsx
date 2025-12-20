import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/shared/components/ui';
import { QrCode } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { config } from '@/lib/config';
import "../../styles/globals.css";

interface LoginProps {
  onNavigate?: (screen: string) => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

export function Login({ onNavigate }: LoginProps) {
  const [rememberMe, setRememberMe] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [serverError, setServerError] = useState<string | null>(null);
  const { devLogin, login, getDefaultRoute, setRememberMeToken } = useAuth();
  const router = useRouter();
  const isDev = config.useMockData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LoginFormData>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Load saved email from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('rememberMeEmail');
      const wasRemembered = localStorage.getItem('rememberMe') === 'true';
      
      if (savedEmail && wasRemembered) {
        setValue('email', savedEmail);
        setRememberMe(true);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      
      // In development mode, use mock authentication
      if (isDev) {
        devLogin('admin');
        return;
      }

      // Call real backend API through AuthContext with rememberMe flag
      console.log('[Login] Calling login with:', data.email, 'Remember me:', rememberMe);
      await login(data.email, data.password, rememberMe);
      
      console.log('[Login] Login successful');
      console.log('[Login] Token stored in:', rememberMe ? 'localStorage' : 'sessionStorage');
      console.log('[Login] localStorage.authToken:', !!localStorage.getItem('authToken'));
      console.log('[Login] sessionStorage.authToken:', !!sessionStorage.getItem('authToken'));
      
      // Save email for next login (only for UX, not for security)
      if (rememberMe) {
        localStorage.setItem('rememberMeEmail', data.email);
        localStorage.setItem('rememberMe', 'true');
        console.log('[Login] Email saved for next login');
      } else {
        localStorage.removeItem('rememberMeEmail');
        localStorage.removeItem('rememberMe');
        console.log('[Login] Email not saved - Remember me is disabled');
      }
      
      // Navigate to user's default route based on role
      const defaultRoute = getDefaultRoute();
      console.log('[Login] Navigating to:', defaultRoute);
      router.push(defaultRoute);
    } catch (error: unknown) {
      console.error('[Login] Login failed:', error);
      
      // Show detailed error in development
      if (isDev && error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          setServerError(`Login failed: ${axiosError.response.data.message}`);
          return;
        }
      }
      
      setServerError('Wrong Email or Password. Please try again.');
    }
  };

  const handleDevLogin = (role: 'admin' | 'kds' | 'waiter') => {
    console.log('[Login] handleDevLogin called with role:', role);
    
    // Clear any stale data from localStorage
    if (typeof window !== 'undefined') {
      console.log('[Login] Clearing localStorage before devLogin');
      localStorage.clear();
    }
    
    // devLogin already handles navigation via router.push in AuthContext
    devLogin(role);
    console.log('[Login] handleDevLogin completed');
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
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Server Error Message */}
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <Input
                label="Email"
                type="email"
                placeholder="admin@restaurant.com"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email format',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            
            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  tabIndex={-1}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                />
                <span className="text-gray-600" style={{ fontSize: '14px' }}>Remember me</span>
              </label>
              
              <button 
                type="button"
                onClick={() => onNavigate?.(ROUTES.forgotPassword)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                style={{ fontSize: '14px', fontWeight: 500 }}
                tabIndex={-1}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full focus:ring-black focus:ring-2" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            {/* Divider with text */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-gray-400 text-center" style={{ fontSize: '12px', fontWeight: 500 }}>
                or continue with
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setServerError(null);
                if (isDev) {
                  devLogin('admin');
                } else {
                  onNavigate?.(ROUTES.dashboard);
                }
              }}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: '48px' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
                <path d="M8.99976 18C11.4298 18 13.467 17.1941 14.9561 15.8195L12.0475 13.5613C11.2416 14.1013 10.2107 14.4204 8.99976 14.4204C6.65567 14.4204 4.67158 12.8372 3.96385 10.71H0.957031V13.0418C2.43794 15.9831 5.48158 18 8.99976 18Z" fill="#34A853"/>
                <path d="M3.96409 10.7098C3.78409 10.1698 3.68182 9.59301 3.68182 8.99983C3.68182 8.40665 3.78409 7.82983 3.96409 7.28983V4.95801H0.957273C0.347727 6.17301 0 7.54755 0 8.99983C0 10.4521 0.347727 11.8266 0.957273 13.0416L3.96409 10.7098Z" fill="#FBBC05"/>
                <path d="M8.99976 3.57955C10.3211 3.57955 11.5075 4.03364 12.4402 4.92545L15.0216 2.34409C13.4629 0.891818 11.4257 0 8.99976 0C5.48158 0 2.43794 2.01682 0.957031 4.95818L3.96385 7.29C4.67158 5.16273 6.65567 3.57955 8.99976 3.57955Z" fill="#EA4335"/>
              </svg>
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Continue with Google</span>
            </button>
            
            <div className="text-center">
              <span className="text-gray-600" style={{ fontSize: '14px' }}>
                Don&apos;t have an account?{' '}
              </span>
              <button 
                onClick={() => onNavigate?.(ROUTES.signup)}
                className="text-emerald-500 hover:text-emerald-600 transition-colors" 
                style={{ fontSize: '14px', fontWeight: 500 }}
                tabIndex={-1}
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Dev mode shortcuts - only show in development */}
          {isDev && (
            <>
              <div className="border-t border-gray-200"></div>
              <div className="flex flex-col gap-3">
                <p className="text-purple-600 text-center flex items-center justify-center gap-2" style={{ fontSize: '12px', fontWeight: 600 }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  DEV MODE: Quick Login
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDevLogin('admin')}
                    className="px-3 py-2 border border-purple-300 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-500 transition-all"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    👤 Admin
                  </button>
                  
                  <button
                    onClick={() => handleDevLogin('kds')}
                    className="px-3 py-2 border border-purple-300 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-500 transition-all"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    🍳 KDS
                  </button>
                  
                  <button
                    onClick={() => handleDevLogin('waiter')}
                    className="px-3 py-2 border border-purple-300 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-500 transition-all"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    🍽️ Waiter
                  </button>
                  
                  <button
                    onClick={() => onNavigate?.(ROUTES.staffInvitationSignup)}
                    className="px-3 py-2 border border-purple-300 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-500 transition-all"
                    style={{ fontSize: '13px', fontWeight: 500 }}
                  >
                    ✉️ Staff Invite
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default Login;
