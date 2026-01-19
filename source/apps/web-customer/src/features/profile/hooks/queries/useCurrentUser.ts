import { useQuery } from '@tanstack/react-query'
import { AuthDataFactory } from '@/features/auth/data'
import { logError } from '@/shared/logging/logger'

/**
 * Query hook for fetching current authenticated user.
 * 
 * BUG-14 Fix: Customers use table session cookies (not JWT tokens),
 * so /auth/me will return 401. We handle this gracefully by returning
 * null (not logged in) instead of throwing an error.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await AuthDataFactory.getStrategy().getCurrentUser()
      } catch (error: any) {
        // 401/403 is expected for anonymous table session users
        // Don't log as error, just return null response
        if (error?.status === 401 || error?.status === 403 || error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
          return { success: true, data: null }
        }
        // Log other unexpected errors
        logError('data', 'Failed to get current user', error, { feature: 'profile' })
        return { success: false, data: null, error: error?.message }
      }
    },
    retry: false,
    // Don't refetch on window focus for profile - user won't change mid-session
    refetchOnWindowFocus: false,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  })
}

