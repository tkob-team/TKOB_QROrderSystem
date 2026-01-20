'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')
    const refreshToken = searchParams.get('refreshToken')
    const error = searchParams.get('error')
    const isNewUser = searchParams.get('isNewUser') === 'true'

    if (error) {
      toast.error('Google login failed. Please try again.')
      router.push('/login')
      return
    }

    if (accessToken && refreshToken) {
      // Store tokens in localStorage - use 'token' key to match API client
      localStorage.setItem('token', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      if (isNewUser) {
        toast.success('Account created successfully!')
      } else {
        toast.success('Login successful!')
      }

      // Navigate to menu
      router.replace('/menu')
    } else {
      toast.error('Authentication failed')
      router.push('/login')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-50)' }}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--orange-500)' }} />
        <p style={{ color: 'var(--gray-600)' }}>Completing sign in...</p>
      </div>
    </div>
  )
}
