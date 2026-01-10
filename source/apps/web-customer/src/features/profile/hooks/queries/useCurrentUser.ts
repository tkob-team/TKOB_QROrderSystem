import { useQuery } from '@tanstack/react-query'
import { AuthService } from '@/api/services/auth.service'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => AuthService.getCurrentUser(),
    retry: false,
  })
}
