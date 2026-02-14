import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { t, translateTypeName, getDisplayAddress } from '@/lib/i18n';
import { getLastEntryType, setLastEntryType, getEntryTypes, getTypeColor } from '@/lib/storage';
import { createEntry } from '@/lib/supabase';

interface AddEntryScreenProps {
  onBack: () => void;
  onSaved: () => void;
  onError: () => void;
}

export function AddEntryScreen({ onBack, onSaved, onError }: AddEntryScreenProps) {
  const { location, loading: locationLoading, error: locationError, retry } = useGeolocation();
  const { photos, addPhoto, removePhoto, uploadAllPhotos, canAddMore } = usePhotoUpload();

  const [entryTypes] = useState(getEntryTypes);
  const [selectedType, setSelectedType] = useState(() => {
    const lastType = getLastEntryType();
    const typeNames = entryTypes.map((t) => t.name);
    return lastType && typeNames.includes(lastType) ? lastType : entryTypes[0]?.name ?? '';
  });
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLastEntryType(selectedType);
  }, [selectedType]);


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
        address_he: location.address_he,
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

  const handleTakePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) addPhoto(file);
    };
    input.click();
  };

  const canSave = !locationLoading && !locationError && location !== null && !saving;

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-surface-50">
      <Header title={t('add.title')} onBack={onBack} />

      <main className="flex-1 p-5 space-y-4 pb-28 animate-fade-in">
        {/* Location Card */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100">
          <div className="flex items-start gap-4">
            <div
              className={`
                w-12 h-12 min-h-0 rounded-2xl flex items-center justify-center flex-shrink-0
                ${locationLoading
                  ? 'bg-primary-100'
                  : locationError
                    ? 'bg-amber-100'
                    : 'bg-success-100'
                }
              `}
            >
              {locationLoading ? (
                <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              ) : locationError ? (
                <svg
                  className="w-6 h-6 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-success-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`
                  text-elderly-base font-semibold
                  ${locationLoading
                    ? 'text-primary-600'
                    : locationError
                      ? 'text-amber-600'
                      : 'text-success-600'
                  }
                `}
              >
                {locationLoading
                  ? t('add.gettingLocation')
                  : locationError
                    ? t('add.locationErrorSoft')
                    : t('add.locationFound')
                }
              </p>
              {(location?.address || location?.address_he) && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {getDisplayAddress(location.address, location.address_he)}
                </p>
              )}
              {!locationLoading && (
                <button
                  onClick={retry}
                  className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  {t('add.refreshLocation')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Type Selection - Dropdown with color indicator */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100">
          <label className="block text-elderly-base font-medium text-gray-700 mb-3">
            {t('add.type')}
          </label>
          <div className="relative">
            <span
              className="absolute start-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full z-10"
              style={{ backgroundColor: getTypeColor(selectedType) }}
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="
                w-full h-touch min-h-touch
                ps-14 pe-12 rounded-2xl
                text-elderly-base font-medium text-gray-900
                bg-white border-2 border-surface-200
                shadow-soft
                focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-400/20
                hover:border-surface-300
                appearance-none
                cursor-pointer
              "
            >
              {entryTypes.map((type) => (
                <option key={type.name} value={type.name}>
                  {translateTypeName(type.name)}
                </option>
              ))}
            </select>
            <div className="absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Photo Section */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100">
          <label className="block text-elderly-base font-medium text-gray-700 mb-3">
            {t('add.photos')} {photos.length > 0 && <span className="text-gray-400">({photos.length}/3)</span>}
          </label>

          {/* Photo previews */}
          {photos.length > 0 && (
            <div className="flex gap-3 flex-wrap mb-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative animate-scale-in">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-soft border-2 border-white">
                    <img
                      src={photo.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="
                      absolute -top-2 -end-2
                      w-7 h-7 min-h-0
                      rounded-full
                      bg-gray-800 text-white
                      flex items-center justify-center
                      shadow-lg
                      hover:bg-gray-900
                      active:scale-95
                    "
                    aria-label="Remove photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Take Photo Button */}
          {canAddMore && (
            <button
              type="button"
              onClick={handleTakePhoto}
              className="
                w-full p-4 rounded-2xl
                bg-surface-50 border-2 border-dashed border-surface-300
                text-gray-600
                hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50
                active:scale-[0.98]
                flex items-center justify-center gap-3
              "
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span className="text-elderly-base font-semibold">{t('add.takePhoto')}</span>
            </button>
          )}
        </div>

        {/* Description Card */}
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-surface-100">
          <Input
            label={t('add.description')}
            placeholder={t('add.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </main>

      {/* Fixed Bottom Save Button */}
      <div className="fixed bottom-0 start-0 end-0 p-5 bg-gradient-to-t from-surface-50 via-surface-50 to-transparent pt-8 safe-bottom">
        <Button onClick={handleSave} disabled={!canSave} size="large">
          {saving ? t('add.saving') : t('add.saveEntry')}
        </Button>
      </div>

      <LoadingOverlay visible={saving} message={t('add.saving')} />
    </div>
  );
}
