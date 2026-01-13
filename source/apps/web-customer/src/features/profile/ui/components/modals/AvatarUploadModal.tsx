import { Camera, ImageIcon, Trash2, X } from 'lucide-react'
import { ChangeEvent, RefObject } from 'react'

interface AvatarUploadModalProps {
  open: boolean
  hasAvatar: boolean
  fileInputRef: RefObject<HTMLInputElement>
  onRequestUpload: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveAvatar: () => void
  onClose: () => void
}

export function AvatarUploadModal({
  open,
  hasAvatar,
  fileInputRef,
  onRequestUpload,
  onFileChange,
  onRemoveAvatar,
  onClose,
}: AvatarUploadModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.35)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: 'white', border: '1px solid var(--gray-200)' }}
      >
        <div className="flex justify-end p-4">
          <button type="button" aria-label="Close" onClick={onClose} className="p-2 rounded-full">
            <X className="w-5 h-5" style={{ color: 'var(--gray-500)' }} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--gray-900)' }}>
              Update profile photo
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
              Upload a new photo or remove the existing one.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={onRequestUpload}
              className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: 'var(--gray-300)', color: 'var(--gray-900)' }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--gray-100)' }}>
                <Camera className="w-5 h-5" style={{ color: 'var(--gray-700)' }} />
              </div>
              <span>Choose from device</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </button>

            {hasAvatar ? (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border text-sm font-semibold transition-colors"
                style={{ borderColor: 'var(--red-200)', color: 'var(--red-600)', backgroundColor: 'var(--red-50)' }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: 'var(--red-100)' }}>
                  <Trash2 className="w-5 h-5" style={{ color: 'var(--red-500)' }} />
                </div>
                <span>Remove current photo</span>
              </button>
            ) : null}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--gray-900)', color: 'white' }}
            >
              <ImageIcon className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
