import { useAuthControllerRegisterSubmit } from '@/services/generated/authentication/authentication'

export function useRegister() {
  return useAuthControllerRegisterSubmit()
}
