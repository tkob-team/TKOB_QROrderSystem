"use client"

import { useRouter } from 'next/navigation'
import { AuthDataFactory } from '@/features/auth/data'
import { useCurrentUser } from './queries/useCurrentUser'
import type { ProfileState } from '../model'

export function useProfileController(): ProfileState & {
  handleLogin: () => void
  handleLogout: () => Promise<void>
  handleViewHistory: () => void
  handleEditProfile: () => void
  handleChangePassword: () => void
} {
  const router = useRouter()
  const { data: userResponse, isLoading } = useCurrentUser()

  const user = userResponse?.data
  const isLoggedIn = !!user

  const handleLogin = () => router.push('/login')
  
  const handleLogout = async () => {
    // Logout only clears JWT token, NOT the table session cookie
    // This allows customer to continue browsing menu after logout
    await AuthDataFactory.getStrategy().logout()
    // Redirect to menu (not home) to keep customer in current table session
    router.push('/menu')
  }
  
  const handleViewHistory = () => router.push('/orders')
  const handleEditProfile = () => router.push('/profile/edit')
  const handleChangePassword = () => router.push('/profile/change-password')

  return {
    user,
    isLoading,
    isLoggedIn,
    handleLogin,
    handleLogout,
    handleViewHistory,
    handleEditProfile,
    handleChangePassword,
  }
}
