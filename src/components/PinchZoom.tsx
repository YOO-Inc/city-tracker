/**
 * Instagram-style pinch zoom component
 * Based on react-instagram-zoom-slider by Sean Kozer, modified for this project
 */

import { useState, useRef, useLayoutEffect, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { animated, to } from '@react-spring/web';
import { useZoom } from '@/hooks/useZoom';

interface PinchZoomProps {
  children: ReactNode;
  enabled?: boolean;
  minScale?: number;
  maxScale?: number;
}

export function PinchZoom({
  children,
  enabled = true,
  minScale = 1,
  maxScale = 4,
}: PinchZoomProps) {
  const [zoomRect, setZoomRect] = useState<DOMRect | null>(null);
  const element = useRef<HTMLDivElement>(null);
  const zoomedRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const onActiveChanged = useCallback((active: boolean) => {
    if (active && !zoomRect) {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const rect = element.current?.getBoundingClientRect();
      if (rect) {
        setZoomRect(rect);
      }
    } else if (!active && zoomRect) {
      timeoutRef.current = setTimeout(() => {
        setZoomRect(null);
        timeoutRef.current = null;
      }, 250);
    }
  }, [zoomRect]);

  useLayoutEffect(() => {
    if (zoomRect && element.current && zoomedRef.current) {
      // Clone the element on DOM level to avoid React re-render issues
      const cloned = element.current.cloneNode(true) as HTMLElement;
      cloned.style.opacity = '1';
      zoomedRef.current.appendChild(cloned);

      // Hide the original
      element.current.style.opacity = '0';
    } else if (!zoomRect && element.current) {
      // Restore original visibility
      if (!isFirstRender.current) {
        element.current.style.opacity = '1';
      } else {
        isFirstRender.current = false;
      }
    }
  }, [zoomRect]);

  const { scale, translateX, translateY, middleTouchOnElement } = useZoom({
    element,
    enabled,
    minScale,
    maxScale,
    onActiveChanged,
  });

  return (
    <>
      <div
        ref={element}
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {children}
      </div>
      {zoomRect !== null &&
        createPortal(
          <animated.div
            ref={zoomedRef}
            style={{
              position: 'fixed',
              zIndex: 9999,
              pointerEvents: 'none',
              width: zoomRect.width,
              height: zoomRect.height,
              top: zoomRect.y,
              left: zoomRect.x,
              transform: to(
                [scale, translateX, translateY],
                (sc, x, y) =>
                  `translate3d(${x}px, ${y}px, 0) scale3d(${sc}, ${sc}, 1)`
              ),
              transformOrigin: middleTouchOnElement.to(
                (x, y) => `${x}px ${y}px 0`
              ),
            }}
          />,
          document.body
        )}
    </>
  );
}
