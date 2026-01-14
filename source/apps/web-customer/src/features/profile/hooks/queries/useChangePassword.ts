import { useMutation } from '@tanstack/react-query'
import { AuthDataFactory } from '@/features/auth/data'

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      AuthDataFactory.getStrategy().changePassword(data),
  })
}
