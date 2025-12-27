/**
 * Menu Item Photo Manager Hook
 * 
 * Manages local photo state for menu item modal with TWO-ROUNDTRIP flow:
 * 1. Create/Update menu item first
 * 2. Then handle photos (upload new, delete removed, set primary, reorder)
 * 
 * This avoids the chicken-and-egg problem where photos API requires itemId
 * but we don't have itemId until the item is created.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type PhotoState = {
  // Existing photo from server (has id, url)
  id?: string;
  url?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  // New file selected by user
  file?: File;
  previewUrl?: string;
  // Internal tracking
  isNewFile: boolean;
  localId: string; // unique ID for tracking in UI
};

export type PhotoManagerState = {
  photos: PhotoState[];
  removedPhotoIds: string[];
  primaryCandidateId: string | null; // Can be existing photo id or local id for new file
};

export function useMenuItemPhotoManager() {
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<string[]>([]);
  const [primaryCandidateId, setPrimaryCandidateId] = useState<string | null>(null);
  
  // Track object URLs for cleanup
  const objectUrlsRef = useRef<string[]>([]);

  /**
   * Initialize photos from existing item (edit mode)
   */
  const initializeFromExistingPhotos = useCallback((existingPhotos: any[]) => {
    // Cleanup old object URLs
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];

    const photoStates: PhotoState[] = existingPhotos.map((photo, index) => ({
      id: photo.id,
      url: photo.url || photo.imageUrl,
      isPrimary: photo.isPrimary ?? false,
      displayOrder: photo.displayOrder ?? index,
      isNewFile: false,
      localId: photo.id,
    }));

    setPhotos(photoStates);
    setRemovedPhotoIds([]);
    
    // Find current primary
    const primary = photoStates.find(p => p.isPrimary);
    setPrimaryCandidateId(primary?.localId || null);
  }, []);

  /**
   * Reset to empty state (add mode or cleanup)
   */
  const reset = useCallback(() => {
    // Cleanup object URLs
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current = [];

    setPhotos([]);
    setRemovedPhotoIds([]);
    setPrimaryCandidateId(null);
  }, []);

  /**
   * Add new files selected by user
   */
  const addNewFiles = useCallback((files: File[]) => {
    const newPhotoStates: PhotoState[] = files.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      objectUrlsRef.current.push(previewUrl);

      const localId = `NEW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        file,
        previewUrl,
        isNewFile: true,
        localId,
        isPrimary: false,
      };
    });

    setPhotos(prev => {
      const updated = [...prev, ...newPhotoStates];
      
      // If no primary set yet and we're adding files, mark first one as primary
      if (!primaryCandidateId && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      
      return updated;
    });

    // If no primary set, make first photo primary
    if (!primaryCandidateId && newPhotoStates.length > 0) {
      setPrimaryCandidateId(newPhotoStates[0].localId);
    }
  }, [primaryCandidateId]);

  /**
   * Remove a photo (mark existing for deletion or remove new file)
   */
  const removePhoto = useCallback((localId: string) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.localId === localId);
      
      if (photoToRemove) {
        // If it's an existing server photo, mark for deletion
        if (!photoToRemove.isNewFile && photoToRemove.id) {
          setRemovedPhotoIds(ids => [...ids, photoToRemove.id!]);
        }
        
        // If it's a new file, cleanup object URL
        if (photoToRemove.isNewFile && photoToRemove.previewUrl) {
          URL.revokeObjectURL(photoToRemove.previewUrl);
          objectUrlsRef.current = objectUrlsRef.current.filter(
            url => url !== photoToRemove.previewUrl
          );
        }

        // Filter out the removed photo
        const remaining = prev.filter(p => p.localId !== localId);
        
        // If removed photo was primary, set first remaining as primary
        if (primaryCandidateId === localId) {
          if (remaining.length > 0) {
            setPrimaryCandidateId(remaining[0].localId);
            remaining[0].isPrimary = true;
          } else {
            setPrimaryCandidateId(null);
          }
        }
        
        return remaining;
      }

      return prev;
    });
  }, [primaryCandidateId]);

  /**
   * Set a photo as primary candidate
   */
  const setPrimary = useCallback((localId: string) => {
    setPrimaryCandidateId(localId);
    
    // Update isPrimary flag on all photos
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      isPrimary: photo.localId === localId,
    })));
  }, []);

  /**
   * Get new files that need to be uploaded
   */
  const getNewFiles = useCallback((): File[] => {
    return photos
      .filter(p => p.isNewFile && p.file)
      .map(p => p.file!);
  }, [photos]);

  /**
   * Check if primary candidate is a new file
   */
  const isPrimaryCandidateNewFile = useCallback((): boolean => {
    if (!primaryCandidateId) return false;
    const photo = photos.find(p => p.localId === primaryCandidateId);
    return photo?.isNewFile ?? false;
  }, [primaryCandidateId, photos]);

  /**
   * Get the photo ID for primary candidate (only for existing photos)
   */
  const getPrimaryCandidatePhotoId = useCallback((): string | null => {
    if (!primaryCandidateId) return null;
    const photo = photos.find(p => p.localId === primaryCandidateId);
    return (!photo?.isNewFile && photo?.id) ? photo.id : null;
  }, [primaryCandidateId, photos]);

  /**
   * Get the index of primary candidate among new files
   */
  const getPrimaryCandidateNewFileIndex = useCallback((): number => {
    if (!primaryCandidateId) return -1;
    const newFiles = photos.filter(p => p.isNewFile);
    return newFiles.findIndex(p => p.localId === primaryCandidateId);
  }, [primaryCandidateId, photos]);

  /**
   * Get desired photo order (mix of existing IDs and new file indices)
   */
  const getPhotoOrder = useCallback((): Array<{ type: 'existing' | 'new'; id?: string; index?: number }> => {
    return photos.map((photo, index) => {
      if (photo.isNewFile) {
        const newFileIndex = photos.slice(0, index + 1).filter(p => p.isNewFile).length - 1;
        return { type: 'new', index: newFileIndex };
      } else {
        return { type: 'existing', id: photo.id };
      }
    });
  }, [photos]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return {
    // State
    photos,
    removedPhotoIds,
    primaryCandidateId,
    
    // Actions
    initializeFromExistingPhotos,
    reset,
    addNewFiles,
    removePhoto,
    setPrimary,
    
    // Getters
    getNewFiles,
    isPrimaryCandidateNewFile,
    getPrimaryCandidatePhotoId,
    getPrimaryCandidateNewFileIndex,
    getPhotoOrder,
    
    // Computed
    hasChanges: removedPhotoIds.length > 0 || photos.some(p => p.isNewFile),
    hasNewFiles: photos.some(p => p.isNewFile),
  };
}
