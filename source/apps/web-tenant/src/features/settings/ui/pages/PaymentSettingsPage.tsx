/**
 * Payment Settings Page
 * Configure SePay payment integration
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  CreditCard,
  Building2,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  TestTube,
} from 'lucide-react';
import { 
  usePaymentConfigControllerGetConfig,
  usePaymentConfigControllerUpdateConfig,
  usePaymentConfigControllerTestConfig,
} from '@/services/generated/payment-config/payment-config';
import { logger } from '@/shared/utils/logger';
import type { UpdatePaymentConfigDto } from '@/services/generated/models';

interface PaymentFormData {
  sepayAccountName: string;
  sepayAccountNo: string;
  sepayApiKey: string;
  sepayBankCode: string;
  sepayEnabled: boolean;
}

export function PaymentSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch current config
  const { data: config, isLoading, refetch } = usePaymentConfigControllerGetConfig();
  const configData = (config as any)?.data || config;

  // Mutations
  const updateMutation = usePaymentConfigControllerUpdateConfig({
    mutation: {
      onSuccess: () => {
        logger.info('[payment-settings] CONFIG_UPDATE_SUCCESS');
        alert('Payment settings updated successfully!');
        refetch();
      },
      onError: (error: any) => {
        logger.error('[payment-settings] CONFIG_UPDATE_ERROR', { error });
        alert('Failed to update settings: ' + (error?.message || 'Unknown error'));
      },
    },
  });

  const testMutation = usePaymentConfigControllerTestConfig({
    mutation: {
      onSuccess: (data: any) => {
        logger.info('[payment-settings] TEST_SUCCESS', { data });
        const result = data?.data || data;
        setTestResult({
          success: result.success !== false,
          message: result.message || 'Connection test successful!',
        });
      },
      onError: (error: any) => {
        logger.error('[payment-settings] TEST_ERROR', { error });
        setTestResult({
          success: false,
          message: error?.message || 'Connection test failed',
        });
      },
    },
  });

  // Form setup
  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<PaymentFormData>({
    defaultValues: {
      sepayAccountName: configData?.sepayAccountName || '',
      sepayAccountNo: configData?.sepayAccountNo || '',
      sepayApiKey: '',
      sepayBankCode: configData?.sepayBankCode || '',
      sepayEnabled: configData?.sepayEnabled || false,
    },
  });

  // Reset form when data loads
  useState(() => {
    if (configData) {
      reset({
        sepayAccountName: configData.sepayAccountName || '',
        sepayAccountNo: configData.sepayAccountNo || '',
        sepayApiKey: '',
        sepayBankCode: configData.sepayBankCode || '',
        sepayEnabled: configData.sepayEnabled || false,
      });
    }
  });

  const onSubmit = (data: PaymentFormData) => {
    logger.info('[payment-settings] SUBMIT_ATTEMPT', { sepayEnabled: data.sepayEnabled });

    const updateData: UpdatePaymentConfigDto = {
      sepayAccountName: data.sepayAccountName,
      sepayAccountNo: data.sepayAccountNo,
      sepayBankCode: data.sepayBankCode,
      sepayEnabled: data.sepayEnabled,
    };

    // Only include API key if provided (since it's masked in the response)
    if (data.sepayApiKey) {
      updateData.sepayApiKey = data.sepayApiKey;
    }

    updateMutation.mutate({ data: updateData });
  };

  const handleTestConnection = () => {
    logger.info('[payment-settings] TEST_CONNECTION_ATTEMPT');
    setTestResult(null);
    testMutation.mutate({
      data: {
        accountNo: configData?.sepayAccountNo || '',
        bankCode: configData?.sepayBankCode || '',
      } as any,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Settings</h1>
        <p className="text-gray-600">
          Configure your SePay payment integration to accept bank transfers via QR code
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              configData?.sepayEnabled ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <CreditCard className={`w-6 h-6 ${
                configData?.sepayEnabled ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">SePay Integration</h3>
              <p className={`text-sm ${
                configData?.sepayEnabled ? 'text-green-600' : 'text-gray-500'
              }`}>
                {configData?.sepayEnabled ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          {configData?.sepayEnabled && (
            <button
              onClick={handleTestConnection}
              disabled={testMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <TestTube className="w-4 h-4" />
              {testMutation.isPending ? 'Testing...' : 'Test Connection'}
            </button>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {testResult.success ? 'Connection Successful' : 'Connection Failed'}
              </p>
              <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">SePay Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Enter your SePay credentials to enable payment processing
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium text-gray-900">Enable SePay Payments</label>
              <p className="text-sm text-gray-600">Accept bank transfers via QR code</p>
            </div>
            <label className="relative inline-block w-14 h-8">
              <input
                type="checkbox"
                {...register('sepayEnabled')}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-green-600 transition-colors"></div>
              <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
            </label>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Account Holder Name
            </label>
            <input
              type="text"
              {...register('sepayAccountName', { required: 'Account name is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Nguyen Van A"
            />
            {errors.sepayAccountName && (
              <p className="mt-1 text-sm text-red-600">{errors.sepayAccountName.message}</p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Account Number
            </label>
            <input
              type="text"
              {...register('sepayAccountNo', { required: 'Account number is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., 1234567890"
            />
            {errors.sepayAccountNo && (
              <p className="mt-1 text-sm text-red-600">{errors.sepayAccountNo.message}</p>
            )}
          </div>

          {/* Bank Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Bank Code
            </label>
            <select
              {...register('sepayBankCode', { required: 'Bank code is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a bank</option>
              <option value="MB">MB Bank (MB)</option>
              <option value="VCB">Vietcombank (VCB)</option>
              <option value="ACB">ACB Bank (ACB)</option>
              <option value="TCB">Techcombank (TCB)</option>
              <option value="VTB">VietinBank (VTB)</option>
              <option value="BIDV">BIDV (BIDV)</option>
              <option value="AGR">Agribank (AGR)</option>
              <option value="SCB">Sacombank (SCB)</option>
              <option value="VPB">VPBank (VPB)</option>
            </select>
            {errors.sepayBankCode && (
              <p className="mt-1 text-sm text-red-600">{errors.sepayBankCode.message}</p>
            )}
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              API Key
              {configData?.sepayApiKeyMasked && (
                <span className="ml-2 text-xs text-gray-500">
                  (Current: {configData.sepayApiKeyMasked})
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                {...register('sepayApiKey', { 
                  minLength: { value: 10, message: 'API key must be at least 10 characters' }
                })}
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={configData?.sepayApiKeyMasked ? 'Leave empty to keep current' : 'Enter your SePay API key'}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
            {errors.sepayApiKey && (
              <p className="mt-1 text-sm text-red-600">{errors.sepayApiKey.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Your API key will be encrypted and stored securely
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isDirty && '* You have unsaved changes'}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={!isDirty || updateMutation.isPending}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!isDirty || updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Contact SePay support to get your API credentials</li>
          <li>• Make sure your account is active and verified</li>
          <li>• Test the connection after saving to ensure everything works</li>
          <li>• Keep your API key secure and never share it publicly</li>
        </ul>
      </div>
    </div>
  );
}
