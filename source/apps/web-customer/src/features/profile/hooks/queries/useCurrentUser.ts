import { useQuery } from '@tanstack/react-query'
import { AuthDataFactory } from '@/features/auth/data'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => AuthDataFactory.getStrategy().getCurrentUser(),
    retry: false,
  })
}
