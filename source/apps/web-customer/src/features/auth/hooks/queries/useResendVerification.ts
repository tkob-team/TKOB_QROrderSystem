import { useMutation } from '@tanstack/react-query'

export function useResendVerification() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      // TODO: Replace with actual API call when endpoint is ready
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },
  })
}
