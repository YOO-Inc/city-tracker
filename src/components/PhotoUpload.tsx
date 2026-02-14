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
      <label className="block text-elderly-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
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

      <div className="flex gap-3 flex-wrap">
        {/* Photo previews */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative animate-scale-in"
          >
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-soft border-2 border-white">
              <img
                src={photo.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(photo.id)}
              className="
                absolute -top-2 -right-2
                w-8 h-8 min-h-0
                rounded-full
                bg-error-500 text-white
                flex items-center justify-center
                shadow-lg
                hover:bg-error-600
                active:scale-95
                focus:outline-none focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2
              "
              aria-label="Remove photo"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {canAddMore && (
          <button
            type="button"
            onClick={handleClick}
            className="
              w-28 h-28
              rounded-2xl
              bg-gradient-to-br from-surface-50 to-surface-100
              border-2 border-dashed border-surface-300
              text-gray-400
              hover:border-primary-400 hover:text-primary-500 hover:from-primary-50 hover:to-primary-100
              active:scale-95
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/50 focus-visible:ring-offset-2
              flex flex-col items-center justify-center gap-1
            "
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
            <span className="text-sm font-medium">Add</span>
          </button>
        )}
      </div>

      <p className="text-sm text-gray-400 mt-3">
        {t('add.photosHint')}
      </p>
    </div>
  );
}
