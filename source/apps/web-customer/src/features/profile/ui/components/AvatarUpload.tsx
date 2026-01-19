'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Loader2, User } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/api/client'
import { log, logError } from '@/shared/logging/logger'

interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatarUrl?: string | null
  /** User's name for fallback display */
  userName?: string
  /** Size of avatar in pixels */
  size?: number
  /** Called when avatar is successfully uploaded */
  onUploadSuccess?: (newAvatarUrl: string) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function AvatarUpload({
  currentAvatarUrl,
  userName = 'User',
  size = 100,
  onUploadSuccess,
}: AvatarUploadProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      log('data', 'Uploading avatar', { size: file.size, type: file.type }, { feature: 'profile' })
      
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await apiClient.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data?.data || response.data
    },
    onSuccess: (data) => {
      log('data', 'Avatar uploaded successfully', {}, { feature: 'profile' })
      toast.success('Avatar updated successfully!')
      
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      
      // Clear preview
      setPreviewUrl(null)
      
      // Notify parent
      if (data?.avatarUrl) {
        onUploadSuccess?.(data.avatarUrl)
      }
    },
    onError: (error: any) => {
      logError('data', 'Avatar upload failed', error, { feature: 'profile' })
      const message = error?.response?.data?.message || 'Failed to upload avatar'
      toast.error(message)
      setPreviewUrl(null)
    },
  })

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, WebP, or GIF image'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be less than 5MB'
    }
    return null
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    uploadMutation.mutate(file)
  }, [validateFile, uploadMutation])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }, [handleFileSelect])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const displayUrl = previewUrl || currentAvatarUrl
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar Display */}
      <div
        className="relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div
          className="rounded-full overflow-hidden flex items-center justify-center transition-all"
          style={{
            width: size,
            height: size,
            backgroundColor: displayUrl ? 'transparent' : 'var(--orange-100)',
            borderWidth: isDragging ? '3px' : '2px',
            borderStyle: 'dashed',
            borderColor: isDragging ? 'var(--orange-500)' : displayUrl ? 'transparent' : 'var(--orange-300)',
          }}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={userName}
              className="w-full h-full object-cover"
              style={{ opacity: uploadMutation.isPending ? 0.5 : 1 }}
            />
          ) : (
            <span 
              style={{ 
                color: 'var(--orange-500)', 
                fontSize: size * 0.35,
                fontWeight: 600,
              }}
            >
              {initials || <User className="w-1/2 h-1/2" />}
            </span>
          )}
          
          {/* Loading Overlay */}
          {uploadMutation.isPending && (
            <div 
              className="absolute inset-0 flex items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            >
              <Loader2 
                className="animate-spin" 
                style={{ color: 'white', width: size * 0.3, height: size * 0.3 }} 
              />
            </div>
          )}
        </div>

        {/* Camera Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="absolute bottom-0 right-0 p-2 rounded-full transition-all hover:scale-110 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--orange-500)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Camera className="w-4 h-4" style={{ color: 'white' }} />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Upload Text */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className="flex items-center gap-1 text-sm hover:underline disabled:opacity-50"
        style={{ color: 'var(--orange-500)' }}
      >
        <Upload className="w-4 h-4" />
        <span>{uploadMutation.isPending ? 'Uploading...' : 'Change Photo'}</span>
      </button>

      {/* Help Text */}
      <p style={{ color: 'var(--gray-500)', fontSize: '12px', textAlign: 'center' }}>
        JPEG, PNG, WebP or GIF • Max 5MB
      </p>
    </div>
  )
}
