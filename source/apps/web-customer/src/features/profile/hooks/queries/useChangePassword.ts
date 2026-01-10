import { useMutation } from '@tanstack/react-query'
import { AuthService } from '@/api/services/auth.service'

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      AuthService.changePassword(data),
  })
}
