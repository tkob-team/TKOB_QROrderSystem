import { useMutation } from '@tanstack/react-query'

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      // TODO: Replace with actual API call when endpoint is ready
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },
  })
}
