import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthDataFactory } from '@/features/auth/data'

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: { name: string }) => AuthDataFactory.getStrategy().updateProfile(data),
    onSuccess: () => {
      // Invalidate current-user query to refresh profile data
      queryClient.invalidateQueries({ queryKey: ['current-user'] })
    },
  })
}
