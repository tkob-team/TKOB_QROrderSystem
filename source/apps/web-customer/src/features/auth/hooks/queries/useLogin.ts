import { useMutation } from '@tanstack/react-query'
import { AuthService } from '@/api/services/auth.service'
import type { LoginForm } from '../../model'

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginForm) => AuthService.login(data),
  })
}
