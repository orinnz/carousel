import React, { useState } from 'react';
import styles from './Carousel.module.css';
import { useCarouselAutoPlay } from '../../hooks/useCarouselAutoPlay';
import { useCarouselDrag } from '../../hooks/useCarouselDrag';

interface CarouselItem {
  id: number | string;
  title: string;
  image: string;
  landing_page?: string;
}

interface CarouselProps {
  items: CarouselItem[];
  autoPlayInterval?: number;
  cardWidth?: number;
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlayInterval = 3000,
  cardWidth = 300,
}) => {
  const extendedItems = [...items, ...items, ...items];

  const [currentIndex, setCurrentIndex] = useState(items.length);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    if (currentIndex < items.length * 2 && currentIndex >= items.length) return;

    const newIndex =
      currentIndex >= items.length * 2
        ? currentIndex - items.length
        : currentIndex + items.length;

    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = `translate3d(${-(newIndex * cardWidth)}px, 0, 0)`;
    }

    setCurrentIndex(newIndex);
  };

  const { startAutoPlay, stopAutoPlay, lastInteractionTime } = useCarouselAutoPlay(
    autoPlayInterval,
    isDragging,
    handleNext
  );

  const { dragOffset, trackRef, handlePointerDown, handlePointerMove, handlePointerUpOrLeave, handleCardClick } =
    useCarouselDrag({
      setIsDragging,
      setIsTransitioning,
      startAutoPlay,
      stopAutoPlay,
      lastInteractionTime,
      onNext: handleNext,
      onPrev: handlePrev,
    });

  const finalTranslate = -(currentIndex * cardWidth) + dragOffset;
  const transitionStyle =
    isTransitioning && !isDragging ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';

  return (
    <div
      className={styles.carouselContainer}
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      <div
        ref={trackRef}
        className={`${styles.track} ${isDragging ? styles.grabbing : styles.grab}`}
        style={{
          transform: `translate3d(${finalTranslate}px, 0, 0)`,
          transition: transitionStyle,
          width: `${extendedItems.length * cardWidth}px`,
        }}
        onTransitionEnd={handleTransitionEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => handlePointerUpOrLeave(e, dragOffset)}
        onPointerCancel={(e) => handlePointerUpOrLeave(e, dragOffset)}
      >
        {extendedItems.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={styles.card}
            style={{ width: `${cardWidth}px` }}
            onClick={(e) => handleCardClick(e, item.landing_page)}
          >
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
