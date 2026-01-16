import { useAuthControllerForgotPassword } from '@/services/generated/authentication/authentication'

export function useRequestPasswordReset() {
  return useAuthControllerForgotPassword()
}
