'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

export interface ImageUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Generate preview URL for uploaded file
  React.useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === 'string') {
      setPreview(value);
      return;
    }

    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [value]);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid format. Please upload ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`;
    }

    // Check file size
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      return `File too large. Maximum size is ${maxSizeMB}MB`;
    }

    return null;
  }, [acceptedFormats, maxSizeMB]);

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onChange(file);
  }, [onChange, validateFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setError(null);
    setPreview(null);
    onChange(null);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {preview ? (
        // Preview State
        <div className="border-2 border-emerald-500 rounded-lg p-6 flex flex-col items-center gap-3 bg-emerald-50 relative">
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-white hover:bg-red-50 rounded-lg transition-colors shadow-sm"
            title="Remove image"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
            <ImageWithFallback
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>

          {value instanceof File && (
            <>
              <p className="text-sm font-semibold text-emerald-700">{value.name}</p>
              <p className="text-xs text-emerald-600">
                {(value.size / 1024).toFixed(1)} KB
              </p>
            </>
          )}

          <button
            onClick={handleRemove}
            className="text-emerald-600 text-sm font-medium hover:text-emerald-700 transition-colors"
          >
            Change image
          </button>
        </div>
      ) : (
        // Upload State
        <label
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div
            className={`w-16 h-16 rounded-lg flex items-center justify-center ${
              error ? 'bg-red-100' : 'bg-gray-100'
            }`}
          >
            {error ? (
              <AlertCircle className="w-8 h-8 text-red-500" />
            ) : (
              <Upload className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="text-center">
            <p
              className={`text-sm font-semibold mb-1 ${
                error ? 'text-red-700' : 'text-gray-900'
              }`}
            >
              {error ? error : 'Drop image or click to upload'}
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} (max. {maxSizeMB}MB)
            </p>
          </div>

          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
