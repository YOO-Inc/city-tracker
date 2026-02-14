import { useState, useCallback } from 'react';
import { uploadPhoto } from '@/lib/supabase';

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
}

interface UsePhotoUploadResult {
  photos: PhotoItem[];
  addPhoto: (file: File) => void;
  removePhoto: (id: string) => void;
  uploadAllPhotos: () => Promise<string[]>;
  canAddMore: boolean;
}

const MAX_PHOTOS = 3;

export function usePhotoUpload(): UsePhotoUploadResult {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const addPhoto = useCallback((file: File) => {
    if (photos.length >= MAX_PHOTOS) return;

    const preview = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random().toString(36).substring(2)}`;

    setPhotos((prev) => [...prev, { id, file, preview }]);
  }, [photos.length]);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const uploadAllPhotos = useCallback(async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const photo of photos) {
      const url = await uploadPhoto(photo.file);
      if (url) {
        urls.push(url);
      }
    }

    return urls;
  }, [photos]);

  return {
    photos,
    addPhoto,
    removePhoto,
    uploadAllPhotos,
    canAddMore: photos.length < MAX_PHOTOS,
  };
}
