"use client"

import { useRouter } from 'next/navigation'
import { AuthService } from '@/api/services/auth.service'
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
    await AuthService.logout()
    router.push('/')
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
