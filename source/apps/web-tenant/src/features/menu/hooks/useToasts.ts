'use client';

import { useEffect, useState } from 'react';

export function useToasts(autoHideMs = 3000) {
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), autoHideMs);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast, autoHideMs]);

  return {
    showSuccessToast,
    setShowSuccessToast,
    toastMessage,
    setToastMessage,
  };
}
