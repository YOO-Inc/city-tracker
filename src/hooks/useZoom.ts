/**
 * Instagram-style pinch zoom hook
 * Based on react-instagram-zoom-slider by Sean Kozer, modified for this project
 */

import { useCallback, useEffect, useRef, RefObject } from 'react';
import { useSpring } from '@react-spring/web';

interface UseZoomOptions {
  enabled?: boolean;
  minScale?: number;
  maxScale?: number;
  onActiveChanged?: (active: boolean) => void;
  element: RefObject<HTMLElement>;
}

function getLengthOfLine(
  point1: { clientX: number; clientY: number },
  point2: { clientX: number; clientY: number }
): number {
  const legX = Math.abs(point2.clientX - point1.clientX);
  const legY = Math.abs(point2.clientY - point1.clientY);
  return Math.sqrt(legX ** 2 + legY ** 2);
}

function getMiddleOfLine(
  point1: { clientX: number; clientY: number },
  point2: { clientX: number; clientY: number }
) {
  return {
    clientX:
      Math.min(point2.clientX, point1.clientX) +
      Math.abs(point2.clientX - point1.clientX) / 2,
    clientY:
      Math.min(point2.clientY, point1.clientY) +
      Math.abs(point2.clientY - point1.clientY) / 2,
  };
}

function getMiddleTouchOnElement(touches: TouchList, boundingRect: DOMRect) {
  const middleTouch = getMiddleOfLine(touches[0], touches[1]);
  return {
    clientX: middleTouch.clientX - boundingRect.left,
    clientY: middleTouch.clientY - boundingRect.top,
  };
}

function isTouchesInsideRect(touches: TouchList, rect: DOMRect): boolean {
  return Array.prototype.every.call(
    touches,
    (touch: Touch) =>
      touch.clientX <= rect.right &&
      touch.clientX >= rect.left &&
      touch.clientY <= rect.bottom &&
      touch.clientY >= rect.top
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(min, value), max);
}

export function useZoom({
  enabled = true,
  minScale = 1,
  maxScale = 4,
  onActiveChanged,
  element,
}: UseZoomOptions) {
  const initialBoundingRect = useRef<DOMRect | null>(null);
  const firstTouch = useRef<[number, number] | null>(null);
  const initialPinchLength = useRef<number | null>(null);

  const [{ scale, middleTouchOnElement, translateX, translateY }, set] =
    useSpring(() => ({
      scale: 1,
      middleTouchOnElement: [0, 0],
      translateX: 0,
      translateY: 0,
      immediate: true,
      config: { duration: 200 },
    }));

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length !== 2) {
        return;
      }

      if (!element.current) return;
      initialBoundingRect.current = element.current.getBoundingClientRect();

      if (
        !event.touches.length ||
        !isTouchesInsideRect(event.touches, initialBoundingRect.current)
      ) {
        return;
      }

      event.preventDefault();

      const [touch1, touch2] = [event.touches[0], event.touches[1]];
      const { clientX, clientY } = getMiddleTouchOnElement(
        event.touches,
        initialBoundingRect.current
      );

      firstTouch.current = [clientX, clientY];
      initialPinchLength.current = getLengthOfLine(touch1, touch2);

      set({
        middleTouchOnElement: [clientX, clientY],
        immediate: true,
      });
      onActiveChanged?.(true);
    },
    [set, onActiveChanged, element]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (firstTouch.current && initialBoundingRect.current && initialPinchLength.current) {
        const currentMiddleTouchOnElement = getMiddleTouchOnElement(
          event.touches,
          initialBoundingRect.current
        );

        const [touch1, touch2] = [event.touches[0], event.touches[1]];
        const currentPinchLength = getLengthOfLine(touch1, touch2);

        set({
          scale: clamp(
            currentPinchLength / initialPinchLength.current,
            minScale,
            maxScale
          ),
          translateX:
            currentMiddleTouchOnElement.clientX - firstTouch.current[0],
          translateY:
            currentMiddleTouchOnElement.clientY - firstTouch.current[1],
          immediate: true,
        });
        onActiveChanged?.(true);
      }
    },
    [set, minScale, maxScale, onActiveChanged]
  );

  const handleTouchEnd = useCallback(() => {
    set({
      scale: 1,
      translateX: 0,
      translateY: 0,
      immediate: false,
    });
    onActiveChanged?.(false);

    firstTouch.current = null;
    initialPinchLength.current = null;
    initialBoundingRect.current = null;
  }, [set, onActiveChanged]);

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    if (enabled) {
      el.addEventListener('touchstart', handleTouchStart, { passive: false });
      el.addEventListener('touchmove', handleTouchMove, { passive: true });
      el.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, element]);

  return { scale, translateX, translateY, middleTouchOnElement };
}
