import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import { PhotoUpload } from '@/components/PhotoUpload';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { t } from '@/lib/i18n';
import { getLastEntryType, setLastEntryType, getEntryTypes } from '@/lib/storage';
import { createEntry } from '@/lib/supabase';

interface AddEntryScreenProps {
  onBack: () => void;
  onSaved: () => void;
  onError: () => void;
}

export function AddEntryScreen({ onBack, onSaved, onError }: AddEntryScreenProps) {
  const { location, loading: locationLoading, error: locationError } = useGeolocation();
  const { photos, addPhoto, removePhoto, uploadAllPhotos, canAddMore } = usePhotoUpload();

  const [entryTypes] = useState(getEntryTypes);
  const [selectedType, setSelectedType] = useState(() => {
    const lastType = getLastEntryType();
    return lastType && entryTypes.includes(lastType) ? lastType : entryTypes[0];
  });
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLastEntryType(selectedType);
  }, [selectedType]);

  const typeOptions = entryTypes.map((type) => ({
    value: type,
    label: type,
  }));

  const handleSave = async () => {
    if (!location) return;

    setSaving(true);

    try {
      const photoUrls = await uploadAllPhotos();

      await createEntry({
        type: selectedType,
        description: description.trim() || null,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        photo_urls: photoUrls,
      });

      onSaved();
    } catch (err) {
      console.error('Failed to save entry:', err);
      onError();
    } finally {
      setSaving(false);
    }
  };

  const canSave = !locationLoading && !locationError && location !== null && !saving;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title={t('add.title')} onBack={onBack} />

      <main className="flex-1 p-6 space-y-6">
        {/* Location Status */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {locationLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
                <span className="text-elderly-base text-gray-600">
                  {t('add.gettingLocation')}
                </span>
              </>
            ) : locationError ? (
              <>
                <svg
                  className="w-6 h-6 text-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-elderly-base text-error">
                  {t('add.locationError')}
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  <p className="text-elderly-base text-success font-medium">
                    {t('add.locationFound')}
                  </p>
                  {location?.address && (
                    <p className="text-elderly-sm text-gray-500 mt-1 line-clamp-2">
                      {location.address}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Type Selection */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <Select
            label={t('add.type')}
            options={typeOptions}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          />
        </div>

        {/* Photo Upload */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <PhotoUpload
            photos={photos}
            onAdd={addPhoto}
            onRemove={removePhoto}
            canAddMore={canAddMore}
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <Input
            label={t('add.description')}
            placeholder={t('add.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button onClick={handleSave} disabled={!canSave}>
            {saving ? t('add.saving') : t('add.save')}
          </Button>
        </div>
      </main>

      <LoadingOverlay visible={saving} message={t('add.saving')} />
    </div>
  );
}
