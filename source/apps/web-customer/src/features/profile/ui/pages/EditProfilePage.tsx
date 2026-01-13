'use client'

import { ArrowLeft, User, Camera } from 'lucide-react'
import { useEditProfileController } from '../../hooks'
import { PROFILE_TEXT } from '../../model'
import { AvatarUploadModal } from '../components/modals/AvatarUploadModal'

export function EditProfilePage() {
  const controller = useEditProfileController()
  const t = PROFILE_TEXT.EN // Static for now, can be extended with language support

  if (controller.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-gray-600">{t.loadingProfile}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={controller.handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)' }}>{t.editProfileTitle}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Avatar with Edit Overlay */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={controller.handleAvatarClick}
            className="relative group"
          >
            {controller.avatar ? (
              <img
                src={controller.avatar}
                alt={controller.name}
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: '4px solid var(--orange-100)' }}
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--orange-500)', border: '4px solid var(--orange-100)' }}
              >
                <User className="w-12 h-12" style={{ color: 'white' }} />
              </div>
            )}
            <div 
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform group-active:scale-95"
              style={{ backgroundColor: 'var(--orange-500)', border: '2px solid white' }}
            >
              <Camera className="w-4 h-4" style={{ color: 'white' }} />
            </div>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label 
              htmlFor="fullName" 
              className="block mb-2"
              style={{ color: 'var(--gray-700)', fontSize: '14px' }}
            >
              {t.fullName} <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={controller.name}
              onChange={(e) => controller.handleNameChange(e.target.value)}
              onBlur={controller.handleNameBlur}
              placeholder={t.fullNamePlaceholder}
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                controller.nameError
                  ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                  : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
              }`}
              style={{ 
                borderColor: controller.nameError ? 'var(--red-500)' : 'var(--gray-300)',
                fontSize: '15px'
              }}
            />
            {controller.nameError && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {controller.nameError}
              </p>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={controller.handleSave}
            disabled={controller.isSaveDisabled || controller.isSaving}
            className={`w-full py-3 px-4 rounded-full transition-all ${
              controller.isSaveDisabled || controller.isSaving
                ? 'cursor-not-allowed' 
                : 'hover:shadow-md active:scale-98'
            }`}
            style={{
              backgroundColor: controller.isSaveDisabled || controller.isSaving ? 'var(--gray-300)' : 'var(--orange-500)',
              color: controller.isSaveDisabled || controller.isSaving ? 'var(--gray-500)' : 'white',
              minHeight: '48px',
              opacity: controller.isSaveDisabled || controller.isSaving ? 0.6 : 1,
              marginTop: '32px',
              marginBottom: '24px',
            }}
          >
            {controller.isSaving ? t.saving : t.saveButton}
          </button>
        </div>
      </div>

      <AvatarUploadModal
        open={controller.isAvatarModalOpen}
        hasAvatar={Boolean(controller.avatar)}
        fileInputRef={controller.fileInputRef}
        onRequestUpload={controller.handleChangePhoto}
        onFileChange={controller.handleFileInputChange}
        onRemoveAvatar={controller.handleRemovePhoto}
        onClose={() => controller.setIsAvatarModalOpen(false)}
      />
    </div>
  )
}
