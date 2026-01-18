'use client';

import React, { useState } from 'react';
import { Card, Button, Switch } from '@/shared/components';
import { CreditCard, QrCode, Banknote, Key, Eye, EyeOff } from 'lucide-react';
import { 
  usePaymentConfigControllerGetConfig,
  usePaymentConfigControllerUpdateConfig,
} from '@/services/generated/payment-config/payment-config';
import type { UpdatePaymentConfigDto } from '@/services/generated/models';

export function TenantPaymentsSection() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [sepayEnabled, setSepayEnabled] = useState(false);
  const [sepayApiKey, setSepayApiKey] = useState('');
  const [sepayAccountNo, setSepayAccountNo] = useState('');
  const [sepayAccountName, setSepayAccountName] = useState('');
  const [sepayBankCode, setSepayBankCode] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState('');

  // Fetch current config
  const { data: config, isLoading, refetch } = usePaymentConfigControllerGetConfig({
    query: {
      retry: false,
      staleTime: 30000, // Cache for 30s
    }
  });
  const configData = (config as any)?.data || config;

  // Set initial values
  React.useEffect(() => {
    if (configData) {
      setSepayEnabled(configData.sepayEnabled || false);
      setSepayAccountNo(configData.sepayAccountNo || '');
      setSepayAccountName(configData.sepayAccountName || '');
      setSepayBankCode(configData.sepayBankCode || '');
      setWebhookEnabled(configData.webhookEnabled || false);
    }
  }, [configData]);

  // Update mutation
  const updateMutation = usePaymentConfigControllerUpdateConfig({
    mutation: {
      onSuccess: () => {
        alert('Payment settings updated successfully!');
        refetch();
      },
      onError: (error: any) => {
        alert('Error: ' + (error?.message || 'Cannot update'));
      },
    },
  });

  const handleSave = () => {
    const payload: UpdatePaymentConfigDto = {
      sepayEnabled,
      ...(sepayApiKey && { sepayApiKey }),
      sepayAccountNo,
      sepayAccountName,
      sepayBankCode,
      webhookEnabled,
      ...(webhookSecret && { webhookSecret }),
    };
    updateMutation.mutate({ data: payload });
  };

  if (isLoading) {
    return <Card className="p-6"><p>Loading...</p></Card>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-text-primary font-semibold">Payment Methods</h3>
          <p className="text-text-secondary text-sm">Configure payment methods for your restaurant</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* SePay QR Payment */}
        <div className="p-4 bg-elevated rounded-lg border border-default">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">SePay QR Code</p>
                <p className="text-sm text-text-secondary">Pay via bank QR code</p>
              </div>
            </div>
            <Switch
              checked={sepayEnabled}
              onChange={setSepayEnabled}
            />
          </div>

          {sepayEnabled && (
            <div className="space-y-3 pt-3 border-t border-default">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={sepayAccountNo}
                  onChange={(e) => setSepayAccountNo(e.target.value)}
                  className="w-full px-3 py-2 border border-default rounded-lg"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={sepayAccountName}
                  onChange={(e) => setSepayAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-default rounded-lg"
                  placeholder="Enter account name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Bank Code
                </label>
                <input
                  type="text"
                  value={sepayBankCode}
                  onChange={(e) => setSepayBankCode(e.target.value)}
                  className="w-full px-3 py-2 border border-default rounded-lg"
                  placeholder="E.g: VCB, TCB, MB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  <Key className="w-4 h-4 inline mr-1" />
                  API Key (optional)
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={sepayApiKey}
                    onChange={(e) => setSepayApiKey(e.target.value)}
                    className="w-full px-3 py-2 border border-default rounded-lg pr-10"
                    placeholder="Enter API key if needed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-2.5"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="pt-3 border-t border-default">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-text-primary">
                    Webhook (for future use)
                  </label>
                  <Switch
                    checked={webhookEnabled}
                    onChange={setWebhookEnabled}
                  />
                </div>
                {webhookEnabled && (
                  <input
                    type="text"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-default rounded-lg text-sm"
                    placeholder="Webhook secret (optional)"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cash Payment - Always enabled */}
        <div className="flex items-center justify-between p-4 bg-elevated rounded-lg border border-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Banknote className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Cash</p>
              <p className="text-sm text-text-secondary">Payment by cash (always enabled)</p>
            </div>
          </div>
          <Switch checked={true} disabled onChange={() => {}} />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-default">
        <Button variant="secondary" onClick={() => refetch()}>Cancel</Button>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </Card>
  );
}
