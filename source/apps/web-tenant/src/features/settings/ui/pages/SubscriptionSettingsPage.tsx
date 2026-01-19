/**
 * Subscription Settings Page
 * Displays current plan, usage, and upgrade options
 */

'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Check, 
  AlertCircle,
  Crown,
  Zap,
  Shield,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  useSubscriptionController,
  useInvalidateSubscription,
} from '../../hooks';
import { PaymentQRModal } from '../components/PaymentQRModal';
import { logger } from '@/shared/utils/logger';

export function SubscriptionSettingsPage() {
  const router = useRouter();
  const {
    publicPlans,
    currentSubscription,
    usage,
    initiateUpgrade,
  } = useSubscriptionController();

  const invalidateSubscription = useInvalidateSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    payment: any;
    planName: string;
  }>({
    isOpen: false,
    payment: null,
    planName: '',
  });

  // Loading states
  const isLoadingPlans = publicPlans.isLoading;
  const isLoadingCurrent = currentSubscription.isLoading;
  const isLoadingUsage = usage.isLoading;

  // Data
  const plans = publicPlans.data || [];
  const current = currentSubscription.data;
  const usageData = usage.data;

  // Extract data from nested structure
  const currentPlan = current?.subscription?.plan?.tier || 'FREE';
  const currentFeatures = current?.subscription?.plan?.features || {};
  const currentUsage = current?.usage || {};

  const handleUpgrade = async (planTier: string) => {
    logger.info('[subscription-page] UPGRADE_CLICKED', { planTier });

    const plan = plans.find(p => p.tier === planTier);
    if (!plan) {
      logger.error('[subscription-page] Plan not found', { planTier });
      return;
    }

    setSelectedPlan(planTier);

    const result = await initiateUpgrade(planTier);

    if (result && result.paymentId) {
      logger.info('[subscription-page] Payment initiated', { 
        paymentId: result.paymentId 
      });

      // Open payment modal
      setPaymentModal({
        isOpen: true,
        payment: result, // Contains paymentId, qrCode, accountNumber, etc.
        planName: plan.name,
      });
    } else {
      logger.error('[subscription-page] Failed to initiate payment');
      setSelectedPlan(null);
    }
  };

  const handlePaymentConfirmed = () => {
    logger.info('[subscription-page] Payment confirmed, refreshing subscription');
    
    // Invalidate queries to refetch
    invalidateSubscription();

    // Close modal
    setPaymentModal({ isOpen: false, payment: null, planName: '' });
    setSelectedPlan(null);

    // Show success message or redirect
    // You can add toast notification here
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return <Shield className="w-6 h-6" />;
      case 'BASIC':
        return <Zap className="w-6 h-6" />;
      case 'PREMIUM':
        return <Crown className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'text-gray-600 bg-gray-100';
      case 'BASIC':
        return 'text-blue-600 bg-blue-100';
      case 'PREMIUM':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoadingPlans || isLoadingCurrent) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription plan and billing
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${getPlanColor(currentPlan)}`}>
              {getPlanIcon(currentPlan)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Current Plan: {currentPlan}
              </h2>
              <p className="text-sm text-gray-600">
                {current?.limits?.maxMenuItems === -1 ? 'Unlimited' : current?.limits?.maxMenuItems} menu items, 
                {current?.limits?.maxTables === -1 ? 'Unlimited' : current?.limits?.maxTables} tables
              </p>
            </div>
          </div>
          {currentPlan !== 'PREMIUM' && (
            <button
              onClick={() => router.push('/admin/subscription#plans')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Upgrade Plan
            </button>
          )}
        </div>

        {/* Usage Stats */}
        {currentUsage && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`border rounded-lg p-4 ${
              current?.limits?.maxMenuItems !== -1 && currentUsage.menuItemsUsed >= current?.limits?.maxMenuItems
                ? 'border-red-300 bg-red-50'
                : currentUsage.menuItemsUsed >= (current?.limits?.maxMenuItems || 0) * 0.8
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200'
            }`}>
              <p className="text-sm text-gray-600">Menu Items</p>
              <p className={`text-2xl font-bold ${
                current?.limits?.maxMenuItems !== -1 && currentUsage.menuItemsUsed >= current?.limits?.maxMenuItems
                  ? 'text-red-700'
                  : 'text-gray-900'
              }`}>
                {currentUsage.menuItemsUsed || 0}
              </p>
              <p className={`text-xs ${
                current?.limits?.maxMenuItems !== -1 && currentUsage.menuItemsUsed >= current?.limits?.maxMenuItems
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-500'
              }`}>
                of {current?.limits?.maxMenuItems === -1 ? '∞' : current?.limits?.maxMenuItems || 0} limit
                {current?.limits?.maxMenuItems !== -1 && currentUsage.menuItemsUsed >= current?.limits?.maxMenuItems && ' ⚠️'}
              </p>
            </div>
            <div className={`border rounded-lg p-4 ${
              current?.limits?.maxTables !== -1 && currentUsage.tablesUsed >= current?.limits?.maxTables
                ? 'border-red-300 bg-red-50'
                : currentUsage.tablesUsed >= (current?.limits?.maxTables || 0) * 0.8
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200'
            }`}>
              <p className="text-sm text-gray-600">Tables</p>
              <p className={`text-2xl font-bold ${
                current?.limits?.maxTables !== -1 && currentUsage.tablesUsed >= current?.limits?.maxTables
                  ? 'text-red-700'
                  : 'text-gray-900'
              }`}>
                {currentUsage.tablesUsed || 0}
              </p>
              <p className={`text-xs ${
                current?.limits?.maxTables !== -1 && currentUsage.tablesUsed >= current?.limits?.maxTables
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-500'
              }`}>
                of {current?.limits?.maxTables === -1 ? '∞' : current?.limits?.maxTables || 0} limit
                {current?.limits?.maxTables !== -1 && currentUsage.tablesUsed >= current?.limits?.maxTables && ' ⚠️'}
              </p>
            </div>
            <div className={`border rounded-lg p-4 ${
              current?.limits?.maxStaff !== -1 && currentUsage.staffUsed >= current?.limits?.maxStaff
                ? 'border-red-300 bg-red-50'
                : currentUsage.staffUsed >= (current?.limits?.maxStaff || 0) * 0.8
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200'
            }`}>
              <p className="text-sm text-gray-600">Staff</p>
              <p className={`text-2xl font-bold ${
                current?.limits?.maxStaff !== -1 && currentUsage.staffUsed >= current?.limits?.maxStaff
                  ? 'text-red-700'
                  : 'text-gray-900'
              }`}>
                {currentUsage.staffUsed || 0}
              </p>
              <p className={`text-xs ${
                current?.limits?.maxStaff !== -1 && currentUsage.staffUsed >= current?.limits?.maxStaff
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-500'
              }`}>
                of {current?.limits?.maxStaff === -1 ? '∞' : current?.limits?.maxStaff || 0} limit
                {current?.limits?.maxStaff !== -1 && currentUsage.staffUsed >= current?.limits?.maxStaff && ' ⚠️'}
              </p>
            </div>
            <div className={`border rounded-lg p-4 ${
              current?.limits?.maxOrdersMonth !== -1 && currentUsage.ordersThisMonth >= current?.limits?.maxOrdersMonth
                ? 'border-red-300 bg-red-50'
                : currentUsage.ordersThisMonth >= (current?.limits?.maxOrdersMonth || 0) * 0.8
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200'
            }`}>
              <p className="text-sm text-gray-600">Orders (this month)</p>
              <p className={`text-2xl font-bold ${
                current?.limits?.maxOrdersMonth !== -1 && currentUsage.ordersThisMonth >= current?.limits?.maxOrdersMonth
                  ? 'text-red-700'
                  : 'text-gray-900'
              }`}>
                {currentUsage.ordersThisMonth || 0}
              </p>
              <p className={`text-xs ${
                current?.limits?.maxOrdersMonth !== -1 && currentUsage.ordersThisMonth >= current?.limits?.maxOrdersMonth
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-500'
              }`}>
                of {current?.limits?.maxOrdersMonth === -1 ? '∞' : current?.limits?.maxOrdersMonth || 0} limit
                {current?.limits?.maxOrdersMonth !== -1 && currentUsage.ordersThisMonth >= current?.limits?.maxOrdersMonth && ' ⚠️'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div id="plans" className="scroll-mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Plans
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.tier === currentPlan;
            const isUpgrade = 
              (currentPlan === 'FREE' && plan.tier !== 'FREE') ||
              (currentPlan === 'BASIC' && plan.tier === 'PREMIUM');

            return (
              <div
                key={plan.id}
                className={`
                  bg-white rounded-lg shadow-sm border-2 p-6
                  ${isCurrent ? 'border-blue-600' : 'border-gray-200'}
                  ${plan.tier === 'PREMIUM' ? 'ring-2 ring-purple-200' : ''}
                `}
              >
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-lg ${getPlanColor(plan.tier)} mb-4`}>
                    {getPlanIcon(plan.tier)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatAmount(plan.priceUSD || 0)}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {Array.isArray(plan.features) && plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-100 text-gray-600 rounded-lg font-semibold"
                  >
                    Current Plan
                  </button>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.tier)}
                    disabled={selectedPlan !== null}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedPlan === plan.tier ? 'Processing...' : 'Upgrade'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}

                {plan.tier === 'PREMIUM' && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Most popular choice
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Important Notes */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
        <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Plan upgrades are processed immediately after payment confirmation</li>
            <li>Unused days from your current plan will be prorated</li>
            <li>Downgrades take effect at the end of your billing cycle</li>
          </ul>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal.payment && (
        <PaymentQRModal
          isOpen={paymentModal.isOpen}
          onClose={() => {
            setPaymentModal({ isOpen: false, payment: null, planName: '' });
            setSelectedPlan(null);
          }}
          payment={paymentModal.payment}
          planName={paymentModal.planName}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </div>
  );
}
