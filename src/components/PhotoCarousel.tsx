import { useState, useRef, useEffect } from 'react';
import { PinchZoom } from './PinchZoom';
import { t } from '@/lib/i18n';

// Check if device supports touch
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}

interface PhotoCarouselProps {
  photos: string[];
}

export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useIsTouchDevice();

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(
        scrollRef.current.scrollLeft / scrollRef.current.clientWidth
      );
      setActiveIndex(index);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="bg-surface-100 rounded-2xl h-48 flex items-center justify-center">
        <p className="text-gray-400 text-elderly-base">{t('preview.noPhotos')}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {photos.map((url, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-full snap-center"
          >
            <PinchZoom enabled={isTouchDevice}>
              <div className="flex justify-center">
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="h-auto max-h-[40vh] rounded-2xl"
                  draggable={false}
                />
              </div>
            </PinchZoom>
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {photos.map((_, index) => (
            <div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${index === activeIndex ? 'bg-primary-500' : 'bg-surface-300'}
              `}
            />
          ))}
        </div>
      )}

      {isTouchDevice && (
        <p className="text-center text-sm text-gray-400 mt-2">
          {t('preview.zoomHint')}
        </p>
      )}
    </div>
  );
}
