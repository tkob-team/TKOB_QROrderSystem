import { useMutation } from '@tanstack/react-query'

export function useRegister() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      // TODO: Replace with actual API call when endpoint is ready
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return response.json()
    },
  })
}
