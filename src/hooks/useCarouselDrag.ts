import React, { useState, useRef } from 'react';

interface UseCarouselDragOptions {
  setIsDragging: (value: boolean) => void;
  setIsTransitioning: (value: boolean) => void;
  startAutoPlay: () => void;
  stopAutoPlay: () => void;
  lastInteractionTime: React.MutableRefObject<number>;
  onNext: () => void;
  onPrev: () => void;
}

export function useCarouselDrag({
  setIsDragging,
  setIsTransitioning,
  startAutoPlay,
  stopAutoPlay,
  lastInteractionTime,
  onNext,
  onPrev,
}: UseCarouselDragOptions) {
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const hasDraggedRef = useRef(false);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartX.current = e.clientX;
    hasDraggedRef.current = false;
    stopAutoPlay();
    if (trackRef.current) trackRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 5) hasDraggedRef.current = true;
    setDragOffset(diff);
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent, currentDragOffset: number) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    lastInteractionTime.current = Date.now();
    startAutoPlay();
    if (trackRef.current) trackRef.current.releasePointerCapture(e.pointerId);

    const threshold = 40;

    if (currentDragOffset > threshold) {
      onPrev();
      requestAnimationFrame(() => setDragOffset(0));
      return;
    }

    if (currentDragOffset < -threshold) {
      onNext();
      requestAnimationFrame(() => setDragOffset(0));
      return;
    }

    setIsTransitioning(true);
    requestAnimationFrame(() => setDragOffset(0));
  };

  const handleCardClick = (e: React.MouseEvent, url?: string) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    if (!url) return;
    window.open(url, '_blank');
  };

  return {
    dragOffset,
    trackRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUpOrLeave,
    handleCardClick,
  };
}
