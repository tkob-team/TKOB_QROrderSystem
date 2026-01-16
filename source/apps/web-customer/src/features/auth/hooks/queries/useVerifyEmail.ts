import { useAuthControllerVerifyEmail } from '@/services/generated/authentication/authentication'

export function useVerifyEmail() {
  return useAuthControllerVerifyEmail()
}
