import { useMutation } from '@tanstack/react-query'
import { AuthDataFactory } from '../../data'

export function useLogout() {
  return useMutation({
    mutationFn: () => AuthDataFactory.getStrategy().logout(),
  })
}
