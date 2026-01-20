/**
 * Subscription Query Hooks
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/shared/utils/logger';
import { subscriptionAdapter } from '../../data/factory';

/**
 * Get all available subscription plans (public)
 */
export const usePublicPlans = () => {
  return useQuery({
    queryKey: ['subscription', 'plans', 'public'],
    queryFn: async () => {
      logger.info('[subscription] PUBLIC_PLANS_QUERY_ATTEMPT');
      try {
        const result = await subscriptionAdapter.getPublicPlans();
        logger.info('[subscription] PUBLIC_PLANS_QUERY_SUCCESS', { count: result?.length || 0 });
        return result;
      } catch (error) {
        logger.error('[subscription] PUBLIC_PLANS_QUERY_ERROR', { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - plans don't change often
  });
};

/**
 * Get feature comparison matrix
 */
export const useFeatureComparison = () => {
  return useQuery({
    queryKey: ['subscription', 'features'],
    queryFn: async () => {
      logger.info('[subscription] FEATURES_QUERY_ATTEMPT');
      try {
        const result = await subscriptionAdapter.getFeatureComparison();
        logger.info('[subscription] FEATURES_QUERY_SUCCESS');
        return result;
      } catch (error) {
        logger.error('[subscription] FEATURES_QUERY_ERROR', { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get current tenant subscription
 */
export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      logger.info('[subscription] CURRENT_QUERY_ATTEMPT');
      try {
        const result = await subscriptionAdapter.getCurrentSubscription();
        logger.info('[subscription] CURRENT_QUERY_SUCCESS', { 
          plan: result?.currentPlan 
        });
        return result;
      } catch (error) {
        logger.error('[subscription] CURRENT_QUERY_ERROR', { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    },
  });
};

/**
 * Get usage statistics
 */
export const useUsage = () => {
  return useQuery({
    queryKey: ['subscription', 'usage'],
    queryFn: async () => {
      logger.info('[subscription] USAGE_QUERY_ATTEMPT');
      try {
        const result = await subscriptionAdapter.getUsage();
        logger.info('[subscription] USAGE_QUERY_SUCCESS');
        return result;
      } catch (error) {
        logger.error('[subscription] USAGE_QUERY_ERROR', { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    },
  });
};

/**
 * Upgrade subscription plan
 */
export const useUpgradePlan = (options?: { mutation?: any }) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      logger.info('[subscription] UPGRADE_ATTEMPT', { targetPlan: data.targetPlan });
      try {
        const result = await subscriptionAdapter.upgradePlan(data);
        logger.info('[subscription] UPGRADE_SUCCESS', { 
          paymentId: result.paymentId 
        });
        return result;
      } catch (error) {
        logger.error('[subscription] UPGRADE_ERROR', { 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      // Don't invalidate yet - wait for payment confirmation
      options?.mutation?.onSuccess?.(data);
    },
    onError: (error) => {
      options?.mutation?.onError?.(error);
    },
  });
};

/**
 * Invalidate subscription queries after successful payment
 */
export const useInvalidateSubscription = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['subscription', 'current'] });
    queryClient.invalidateQueries({ queryKey: ['subscription', 'usage'] });
  };
};
