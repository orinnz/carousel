# Frontend Home Test - Interactive Carousel

This project is an implementation of a reusable, interactive carousel component built with React and TypeScript, designed specifically for the Frontend Middle role test.

## Project Setup & Running Locally

This project was built using Vite. To run this project locally, follow these steps:

1. **Prerequisites**: Make sure you have Node.js installed (v16+ recommended) and `pnpm` installed globally (`npm install -g pnpm`).
2. **Install Dependencies**:
   ```bash
   pnpm install
   ```
3. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   *The application will typically be available at `http://localhost:5173/` or as specified in your terminal.*

4. **Build for Production**:
   ```bash
   pnpm build
   ```

## Project Structure

```
src/
├── App.tsx                          # Entry point — integrates Carousel with mock data
├── App.css                          # Base responsive layout styling
├── hooks/
│   ├── useCarouselAutoPlay.ts       # Auto-play interval logic
│   └── useCarouselDrag.ts           # Pointer drag/swipe state and event handlers
└── components/
    └── Carousel/
        ├── Carousel.tsx             # Core component — navigation, infinite loop, layout
        └── Carousel.module.css      # Scoped styles — track, cards, animations, overlays
```

## Implementation Details

### Drag & Swipe Interactions

Drag (mouse) and swipe (touch) interactions are unified using **Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`), handled inside the `useCarouselDrag` hook.

- **Tracking Movement**: When `onPointerDown` fires, the initial X coordinate is recorded. As `onPointerMove` fires, the difference (`dragOffset`) is calculated and applied directly to the CSS `transform` via inline style, giving a 1:1 follow effect.
- **Triggering a Slide**: On `onPointerUp`, if `dragOffset` exceeds the 40px threshold, `handleNext()` or `handlePrev()` is called and the offset clears with the CSS transition. Otherwise the track snaps back to its original position.

### Handling Edge Cases

#### Infinite Looping
The data array is tripled (`[...items, ...items, ...items]`) and the initial index is set to the start of the middle set. When navigation moves past the middle set bounds, `onTransitionEnd` fires — the DOM transform is synchronously updated via `trackRef.current.style` (before React re-renders) to snap the track to the correct mirrored position in the middle set. This eliminates any visible blank-space frame between the last and first slide.

#### Click Prevention While Dragging
A `hasDraggedRef` boolean is set to `true` if the pointer moves more than 5 pixels during a press. The `onClick` handler on each card checks this ref first and calls `e.preventDefault()` with an early return, preventing accidental navigation to a landing page when the user was dragging.

#### Pause Auto-Slide on Hover or Interaction
- **Hover**: `onMouseEnter` and `onMouseLeave` on the carousel container call `stopAutoPlay` and `startAutoPlay` directly.
- **Interaction**: The auto-play interval (managed in `useCarouselAutoPlay`) only calls `handleNext()` if `isDragging` is `false` AND `Date.now() - lastInteractionTime > 1000ms`, preventing the carousel from jumping immediately after a drag is released.
