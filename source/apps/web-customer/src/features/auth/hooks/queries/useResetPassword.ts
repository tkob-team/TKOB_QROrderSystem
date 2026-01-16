import { useAuthControllerResetPassword } from '@/services/generated/authentication/authentication'

export function useResetPassword() {
  return useAuthControllerResetPassword()
}
