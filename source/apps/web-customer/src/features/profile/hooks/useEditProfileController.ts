"use client"

import { ChangeEvent, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCurrentUser } from './queries/useCurrentUser'
import { useUpdateProfile } from './queries/useUpdateProfile'
import type { EditProfileForm, FormErrors, TouchedFields } from '../model'

export function useEditProfileController() {
  const router = useRouter()
  const { data: userResponse, isLoading } = useCurrentUser()
  const saveMutation = useUpdateProfile()
  
  const user = userResponse?.data
  
  const [name, setName] = useState(user?.name || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [nameError, setNameError] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Update name when user data loads
  if (user && !name && user.name) {
    setName(user.name)
  }

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError('Full name is required')
      return false
    }
    setNameError('')
    return true
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (nameTouched) {
      validateName(value)
    }
  }

  const handleNameBlur = () => {
    setNameTouched(true)
    validateName(name)
  }

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true)
  }

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    setIsAvatarModalOpen(false)
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleChangePhoto = () => {
    fileInputRef.current?.click()
    setIsAvatarModalOpen(true)
  }

  const handleRemovePhoto = () => {
    setAvatar('')
    setIsAvatarModalOpen(false)
  }

  const handleSave = () => {
    setNameTouched(true)
    if (!validateName(name)) {
      return
    }

    saveMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success('Profile updated successfully!')
            router.back()
          } else {
            toast.error('Failed to update profile')
          }
        },
        onError: () => {
          toast.error('An error occurred')
        },
      }
    )
  }

  const handleBack = () => {
    router.back()
  }

  const isNameValid = name.trim().length > 0
  const isSaveDisabled = !isNameValid

  return {
    // State
    user,
    isLoading,
    name,
    avatar,
    nameError,
    nameTouched,
    isAvatarModalOpen,
    fileInputRef,
    isSaveDisabled,
    isSaving: saveMutation.isPending,
    
    // Actions
    handleNameChange,
    handleNameBlur,
    handleAvatarClick,
    handleFileInputChange,
    handleChangePhoto,
    handleRemovePhoto,
    handleSave,
    handleBack,
    setIsAvatarModalOpen,
  }
}
