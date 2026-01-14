import { useMutation } from '@tanstack/react-query'
import { AuthDataFactory } from '../../data'
import type { LoginForm } from '../../model'

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginForm) => AuthDataFactory.getStrategy().login(data),
  })
}
