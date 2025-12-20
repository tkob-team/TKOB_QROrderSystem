'use client'

import { X, Upload, Camera, User } from 'lucide-react';
import { useState, useRef } from 'react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  currentAvatar?: string;
  userName: string;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
}

export function AvatarUploadModal({ isOpen, currentAvatar, userName, onClose, onSave }: AvatarUploadModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatar);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(undefined);
  };

  const handleSave = () => {
    onSave(previewUrl || '');
    onClose();
  };

  const handleCancel = () => {
    setPreviewUrl(currentAvatar);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--gray-200)' }}>
            <h3 style={{ color: 'var(--gray-900)' }}>Change profile photo</h3>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-[var(--gray-100)]"
            >
              <X className="w-5 h-5" style={{ color: 'var(--gray-600)' }} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current/Preview Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={userName}
                    className="w-32 h-32 rounded-full object-cover"
                    style={{ border: '4px solid var(--gray-200)' }}
                  />
                ) : (
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--orange-500)', border: '4px solid var(--gray-200)' }}
                  >
                    <User className="w-16 h-16" style={{ color: 'white' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging ? 'border-[var(--orange-500)] bg-[var(--orange-50)]' : 'border-[var(--gray-300)]'
              }`}
              onClick={handleChooseFile}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--orange-100)' }}
                >
                  <Camera className="w-6 h-6" style={{ color: 'var(--orange-500)' }} />
                </div>
                <div>
                  <p style={{ color: 'var(--gray-900)', marginBottom: '4px' }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                    PNG, JPG or JPEG (max. 5MB)
                  </p>
                </div>
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

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              {previewUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="flex-1 py-3 px-4 rounded-full border transition-all hover:bg-[var(--gray-50)] active:scale-98"
                  style={{
                    borderColor: 'var(--red-300)',
                    color: 'var(--red-600)',
                    minHeight: '48px',
                  }}
                >
                  Remove photo
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-4 rounded-full transition-all hover:shadow-md active:scale-98"
                style={{
                  backgroundColor: 'var(--orange-500)',
                  color: 'white',
                  minHeight: '48px',
                }}
              >
                {previewUrl ? 'Save changes' : 'Skip for now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
