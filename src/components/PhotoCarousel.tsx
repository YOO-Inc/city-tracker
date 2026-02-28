import { useState, useRef } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { t } from '@/lib/i18n';

interface PhotoCarouselProps {
  photos: string[];
}

function ZoomControls() {
  const { zoomIn, zoomOut } = useControls();

  return (
    <div className="absolute bottom-3 end-3 flex flex-col gap-2 opacity-0 hover-device:opacity-100 transition-opacity">
      <button
        onClick={() => zoomIn()}
        className="w-10 h-10 min-h-0 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white active:scale-95"
        aria-label={t('preview.zoomIn')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      <button
        onClick={() => zoomOut()}
        className="w-10 h-10 min-h-0 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white active:scale-95"
        aria-label={t('preview.zoomOut')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
      </button>
    </div>
  );
}

export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
            className="flex-shrink-0 w-full snap-center relative"
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={4}
              centerOnInit
              wheel={{ disabled: true }}
              panning={{ velocityDisabled: false }}
              velocityAnimation={{
                sensitivity: 1,
                animationTime: 300,
                animationType: 'easeOut',
                equalToMove: true,
              }}
              alignmentAnimation={{
                sizeX: 100,
                sizeY: 100,
                animationTime: 200,
                animationType: 'easeOut',
              }}
            >
              <TransformComponent
                wrapperStyle={{ width: '100%' }}
                contentStyle={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <img
                  src={url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-auto max-h-[40vh] object-contain rounded-2xl"
                  draggable={false}
                />
              </TransformComponent>
              <ZoomControls />
            </TransformWrapper>
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

      <p className="text-center text-sm text-gray-400 mt-2 touch-device:block hover-device:hidden">
        {t('preview.zoomHint')}
      </p>
    </div>
  );
}
