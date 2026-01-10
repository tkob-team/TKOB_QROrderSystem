import { useMutation } from '@tanstack/react-query'

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (data: { token: string }) => {
      // TODO: Replace with actual API call when endpoint is ready
      const response = await fetch(`/api/auth/verify-email?token=${data.token}`, {
        method: 'GET',
      })
      return response.json()
    },
  })
}
