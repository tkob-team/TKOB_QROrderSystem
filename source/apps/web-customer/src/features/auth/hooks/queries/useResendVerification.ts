import { useAuthControllerResendVerification } from '@/services/generated/authentication/authentication'

export function useResendVerification() {
  return useAuthControllerResendVerification()
}
