'use client'

import { ArrowLeft, User, Camera, Upload, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { AuthService } from '@/api/services/auth.service';

export function EditProfilePage() {
  const router = useRouter();
  
  // Fetch current user
  const { data: userResponse, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => AuthService.getCurrentUser()
  });
  
  const user = userResponse?.data;
  
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [nameError, setNameError] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update name when user data loads
  if (user && !name && user.name) {
    setName(user.name);
  }
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: { name: string }) => AuthService.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Profile updated successfully!');
        router.back();
      } else {
        toast.error('Failed to update profile');
      }
    },
    onError: () => {
      toast.error('An error occurred');
    }
  });

  // Check if form is valid
  const isNameValid = name.trim().length > 0;
  const isSaveDisabled = !isNameValid;

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Full name is required');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // Only show validation if field has been touched
    if (nameTouched) {
      validateName(value);
    }
  };

  const handleNameBlur = () => {
    setNameTouched(true);
    validateName(name);
  };

  const handleAvatarClick = () => {
    setShowAvatarMenu(true);
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setShowAvatarMenu(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
    setShowAvatarMenu(false);
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    setShowAvatarMenu(false);
  };

  const handleSave = () => {
    // Validate before saving
    setNameTouched(true);
    if (!validateName(name)) {
      return;
    }

    // Save
    saveMutation.mutate({ name: name.trim() });
  };

  const handleBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4" style={{ borderColor: 'var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--gray-900)' }} />
          </button>
          <h2 style={{ color: 'var(--gray-900)' }}>Edit profile</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Avatar with Edit Overlay */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleAvatarClick}
            className="relative group"
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name}
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
            {/* Camera Icon Overlay */}
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
              Full name <span style={{ color: 'var(--red-500)' }}>*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={handleNameBlur}
              placeholder="Enter your full name"
              className={`w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                nameError
                  ? 'border-[var(--red-500)] focus:ring-[var(--red-200)] focus:border-[var(--red-500)]'
                  : 'focus:ring-[var(--orange-200)] focus:border-[var(--orange-500)]'
              }`}
              style={{ 
                borderColor: nameError ? 'var(--red-500)' : 'var(--gray-300)',
                fontSize: '15px'
              }}
            />
            {nameError && (
              <p style={{ color: 'var(--red-500)', fontSize: '13px', marginTop: '6px' }}>
                {nameError}
              </p>
            )}
          </div>



          {/* Save Button (in natural scroll position) */}
          <button
            onClick={handleSave}
            disabled={isSaveDisabled || saveMutation.isPending}
            className={`w-full py-3 px-4 rounded-full transition-all ${
              isSaveDisabled || saveMutation.isPending
                ? 'cursor-not-allowed' 
                : 'hover:shadow-md active:scale-98'
            }`}
            style={{
              backgroundColor: isSaveDisabled || saveMutation.isPending ? 'var(--gray-300)' : 'var(--orange-500)',
              color: isSaveDisabled || saveMutation.isPending ? 'var(--gray-500)' : 'white',
              minHeight: '48px',
              opacity: isSaveDisabled || saveMutation.isPending ? 0.6 : 1,
              marginTop: '32px',
              marginBottom: '24px',
            }}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Avatar Action Menu (Bottom Sheet) */}
      {showAvatarMenu && (
        <>
          {/* Subtle Backdrop Dimming (5-8% black opacity) */}
          <div 
            className="fixed inset-0 z-40 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.06)' }}
            onClick={() => setShowAvatarMenu(false)}
          />

          {/* Light Bottom Sheet */}
          <div 
            className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl animate-slide-up"
            style={{ 
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
            }}
          >
            <div className="p-6">
              {/* Title */}
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

              {/* Upload Action */}
              <button
                onClick={handleChangePhoto}
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

              {/* Remove Photo (if avatar exists) */}
              {avatar && (
                <button
                  onClick={handleRemovePhoto}
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

              {/* Cancel Button */}
              <button
                onClick={() => setShowAvatarMenu(false)}
                className="w-full py-3 px-4 rounded-full transition-all hover:bg-[var(--gray-50)] active:scale-98"
                style={{
                  border: '1px solid var(--gray-300)',
                  color: 'var(--gray-700)',
                  minHeight: '48px',
                  fontSize: '15px',
                  marginTop: avatar ? '0' : '16px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}