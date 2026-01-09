'use client'

import { ArrowLeft, User, Camera, Upload, Trash2 } from 'lucide-react'
import { useEditProfileController } from '../../hooks'
import { PROFILE_TEXT } from '../../model'

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

      {/* Hidden File Input */}
      <input
        ref={controller.fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={controller.handleFileInputChange}
        className="hidden"
      />

      {/* Avatar Action Menu */}
      {controller.showAvatarMenu && (
        <>
          <div 
            className="fixed inset-0 z-40 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }}
            onClick={() => controller.setShowAvatarMenu(false)}
          />

          <div 
            className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl animate-slide-up"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
            }}
          >
            <div className="p-6">
              <h3 
                className="mb-4"
                style={{ 
                  color: 'var(--gray-900)',
                  fontSize: '18px',
                  textAlign: 'left',
                }}
              >
                Change photo
              </h3>

              <button
                onClick={controller.handleChangePhoto}
                className="w-full p-4 rounded-xl flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)] mb-2"
                style={{ border: '1px solid var(--gray-200)' }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--orange-100)' }}
                >
                  <Upload className="w-5 h-5" style={{ color: 'var(--orange-500)' }} />
                </div>
                <div className="text-left flex-1">
                  <p style={{ color: 'var(--gray-900)', fontSize: '15px' }}>Upload from device</p>
                  <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>Choose a photo from your gallery</p>
                </div>
              </button>

              {controller.avatar && (
                <button
                  onClick={controller.handleRemovePhoto}
                  className="w-full p-4 rounded-xl flex items-center gap-3 transition-colors hover:bg-[var(--gray-50)] active:bg-[var(--gray-100)] mb-4"
                  style={{ border: '1px solid var(--gray-200)' }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--red-100)' }}
                  >
                    <Trash2 className="w-5 h-5" style={{ color: 'var(--red-500)' }} />
                  </div>
                  <div className="text-left flex-1">
                    <p style={{ color: 'var(--red-600)', fontSize: '15px' }}>Remove photo</p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '13px' }}>Use default avatar</p>
                  </div>
                </button>
              )}

              <button
                onClick={() => controller.setShowAvatarMenu(false)}
                className="w-full py-3 px-4 rounded-full transition-all hover:bg-[var(--gray-50)] active:scale-98"
                style={{
                  border: '1px solid var(--gray-300)',
                  color: 'var(--gray-700)',
                  minHeight: '48px',
                  fontSize: '15px',
                  marginTop: controller.avatar ? '0' : '16px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
