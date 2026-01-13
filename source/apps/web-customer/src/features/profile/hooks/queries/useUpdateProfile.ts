import { useMutation } from '@tanstack/react-query'
import { AuthService } from '@/api/services/auth.service'

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: { name: string }) => AuthService.updateProfile(data),
  })
}
