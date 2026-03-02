import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Carousel.module.css';

interface CarouselItem {
  id: number | string;
  title: string;
  image: string;
  landing_page?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number; // default 3000ms
  cardWidth?: number; // default 300px
}

export const Carousel: React.FC<CarouselProps> = ({ 
  items, 
  autoPlayInterval = 3000,
  cardWidth = 300 
}) => {
  // To create a seamless infinite loop, we need to duplicate the items.
  // We'll prepend one set and append one set: [ ...items, ...items, ...items ]
  // The user initially sees the middle set.
  const extendedItems = [...items, ...items, ...items];
  
  // Start at the beginning of the "middle" set
  const [currentIndex, setCurrentIndex] = useState(items.length);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Refs for drag tracking
  const dragStartX = useRef(0);
  const lastInteractionTime = useRef(Date.now());
  const hasDraggedRef = useRef(false);

  // --- Auto Play Logic ---
  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      // Only slide if not currently interacting (dragging)
      if (!isDragging && Date.now() - lastInteractionTime.current > 1000) {
         // Requirement: sliding direction right to left (meaning next slide comes from the right)
         handleNext();
      }
    }, autoPlayInterval);
  }, [autoPlayInterval, isDragging]);

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay]);

  // --- Navigation Logic ---
  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  // --- Infinite Loop Logic (The "Magic" Snap) ---
  // When the transition ends, we check if we've moved completely out of the "middle" safe zone
  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    // If we've reached the start of the 3rd set (right bounds)
    if (currentIndex >= items.length * 2) {
      // Snap back to the corresponding slide in the middle set
      setCurrentIndex(currentIndex - items.length);
    } 
    // If we've reached the end of the 1st set (left bounds)
    else if (currentIndex < items.length) {
      // Snap forward to the corresponding slide in the middle set
      setCurrentIndex(currentIndex + items.length);
    }
  };

  // --- Drag & Swipe Handlers ---
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    hasDraggedRef.current = false;
    stopAutoPlay(); // Pause on interaction
    
    // Optional: Capture pointer to track outside bounds
    if (trackRef.current) {
      trackRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = currentX - dragStartX.current;
    
    // Only register as "dragged" if moved a little bit (prevent accidental drag on small jitters)
    if (Math.abs(diff) > 5) {
      hasDraggedRef.current = true;
    }
    
    setDragOffset(diff);
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    lastInteractionTime.current = Date.now();
    startAutoPlay(); // Resume auto-play

    if (trackRef.current) {
      trackRef.current.releasePointerCapture(e.pointerId);
    }

    // Determine if we dragged enough to trigger a slide (Requirement: 40px)
    const threshold = 40;
    
    if (dragOffset > threshold) {
      // Swiped Right -> go Prev
      handlePrev();
      // Add a small delay for dragging visual snap before clearing offset
      requestAnimationFrame(() => setDragOffset(0));
    } else if (dragOffset < -threshold) {
      // Swiped Left -> go Next
      handleNext();
      requestAnimationFrame(() => setDragOffset(0));
    } else {
      // Didn't drag enough, just snap back to current
      setIsTransitioning(true);
      requestAnimationFrame(() => setDragOffset(0));
    }
  };

  // Handle click on Card
  const handleCardClick = (e: React.MouseEvent, url?: string) => {
    // Prevent accidental clicks while user was dragging
    if (hasDraggedRef.current) {
      e.preventDefault();
      return;
    }
    
    if (url) {
      // Simulated routing / external link opening
      window.open(url, '_blank');
    }
  };

  // --- Calculate Track Translation ---
  // Base transform moving strictly by currentIndex and cardWidth
  const baseTranslate = -(currentIndex * cardWidth);
  // Add dragOffset for 1:1 follow effect while dragging
  const finalTranslate = baseTranslate + dragOffset;
  
  // Transition speed: 0s if dragging or snapping, 0.5s if smoothly sliding
  const transitionStyle = isTransitioning && !isDragging 
    ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' 
    : 'none';

  return (
    <div 
      className={styles.carouselContainer}
      onMouseEnter={stopAutoPlay} // Pause auto-sliding on hover
      onMouseLeave={startAutoPlay}
    >
      <div 
        ref={trackRef}
        className={`${styles.track} ${isDragging ? styles.grabbing : styles.grab}`}
        style={{
          transform: `translate3d(${finalTranslate}px, 0, 0)`,
          transition: transitionStyle,
          width: `${extendedItems.length * cardWidth}px`
        }}
        onTransitionEnd={handleTransitionEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrLeave}
        onPointerCancel={handlePointerUpOrLeave} // Fallback for interrupted touch
      >
        {extendedItems.map((item, index) => (
          <div 
            key={`${item.id}-${index}`}
            className={styles.card}
            style={{ width: `${cardWidth}px` }}
            onClick={(e) => handleCardClick(e, item.landing_page)}
          >
            {/* Prevent default image dragging which conflicts with our custom pointer events */}
            <img 
              src={item.image} 
              alt={item.title} 
              className={styles.cardImage}
              draggable={false} 
            />
            <div className={styles.cardTitleOverlay}>
              <span className={styles.cardTitle}>{item.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
