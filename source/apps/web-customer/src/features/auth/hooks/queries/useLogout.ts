import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthDataFactory } from '../../data'

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      // Clear localStorage token first
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      return AuthDataFactory.getStrategy().logout()
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear()
    },
    onError: () => {
      // Even if API fails, clear local state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      queryClient.clear()
    },
  })
}
