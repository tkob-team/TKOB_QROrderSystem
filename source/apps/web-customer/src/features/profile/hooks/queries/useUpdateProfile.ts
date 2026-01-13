import { useMutation } from '@tanstack/react-query'
import { AuthDataFactory } from '@/features/auth/data'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { name: string }) => AuthDataFactory.getStrategy().updateProfile(data),
  })
}
