import { useCallback, useEffect, useRef } from 'react';

export function useCarouselAutoPlay(
  autoPlayInterval: number,
  isDragging: boolean,
  onNext: () => void
) {
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastInteractionTime = useRef(Date.now());

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      if (!isDragging && Date.now() - lastInteractionTime.current > 1000) {
        onNext();
      }
    }, autoPlayInterval);
  }, [autoPlayInterval, isDragging, onNext, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  return { startAutoPlay, stopAutoPlay, lastInteractionTime };
}
