import { useRef } from 'react';
import { t } from '@/lib/i18n';

interface PhotoItem {
  id: string;
  preview: string;
}

interface PhotoUploadProps {
  photos: PhotoItem[];
  onAdd: (file: File) => void;
  onRemove: (id: string) => void;
  canAddMore: boolean;
}

export function PhotoUpload({
  photos,
  onAdd,
  onRemove,
  canAddMore,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAdd(file);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="block text-elderly-base font-medium text-gray-700 mb-2">
        {t('add.photos')}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      {canAddMore && (
        <button
          type="button"
          onClick={handleClick}
          className="
            w-full h-touch-lg min-h-touch-lg
            px-6 rounded-xl
            text-elderly-lg font-semibold
            bg-gray-100 text-gray-700
            border-2 border-dashed border-gray-300
            hover:bg-gray-200 hover:border-gray-400
            focus:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2
            transition-colors duration-200
            flex items-center justify-center gap-3
          "
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {t('add.addPhoto')}
        </button>
      )}

      <p className="text-elderly-sm text-gray-500 mt-2 text-center">
        {t('add.photosHint')}
      </p>

      {photos.length > 0 && (
        <div className="flex gap-3 mt-4 flex-wrap">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <img
                src={photo.preview}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                className="
                  absolute -top-2 -right-2
                  w-8 h-8 min-h-0
                  rounded-full
                  bg-error text-white
                  flex items-center justify-center
                  shadow-lg
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2
                "
                aria-label="Remove photo"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
