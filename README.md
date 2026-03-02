# Frontend Home Test - Interactive Carousel

This project is an implementation of a reusable, interactive carousel component built with React and TypeScript, designed specifically for the Frontend Middle role test.

## Project Setup & Running Locally

This project was built using Vite. To run this project locally, follow these steps:

1. **Prerequisites**: Make sure you have Node.js installed (v16+ recommended).
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   *The application will typically be available at `http://localhost:5173/` or as specified in your terminal.*

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure

- `src/App.tsx`: The main entry point integrating the `Carousel` component with Mock Data.
- `src/App.css`: Base responsive layout styling.
- `src/components/Carousel/Carousel.tsx`: The core logical component managing state, interactions, and auto-play logic.
- `src/components/Carousel/Carousel.module.css`: Scoped CSS styles for tracking UI, animations, and overlays.

## Implementation Details

### Drag & Swipe Interactions

The drag (mouse) and swipe (touch) interactions are unified using **Pointer Events** (`onPointerDown`, `onPointerMove`, `onPointerUp`).

- **Tracking Movement**: When `onPointerDown` is triggered, the initial X coordinate is recorded. As `onPointerMove` fires, the difference (`dragOffset`) is calculated and applied directly to the CSS `transform` value via an inline style.
- **Triggering a Slide**: When the pointer is released (`onPointerUp`), the component checks if `dragOffset` exceeds the minimum threshold of `40px`. 
  - If it does, `handleNext()` or `handlePrev()` is called, and the offset resolves with a CSS transition.
  - If not, the track simply snaps back to its original position by clearing the offset.

### Handling Edge Cases

#### Infinite Looping
To create a seamless infinite loop without visual jumps, the data array is tripled (`[...items, ...items, ...items]`). The user begins in the center set.
When the user navigates past the bounds of the middle set, the `onTransitionEnd` event detects this state and instantly (with no transition time) modifies the state to snap the user back to the corresponding slide within the middle set. 

#### Click Prevention While Dragging
To ensure users don't accidentally navigate to a landing page when dragging across a slide, a `hasDraggedRef` boolean is used.
This ref is set to `true` if the pointer moves more than 5 pixels during a press. The `onClick` handler of each card explicitly checks this ref and calls `e.preventDefault()` and `return` early if a drag just occurred.

#### Pause Auto-Slide on Hover or Interaction
- **Hover**: Simple `onMouseEnter` and `onMouseLeave` handlers wrap the Carousel container, explicitly pausing and resuming the `setInterval`.
- **Interaction**: The `startAutoPlay` logic contains a guard clause: it will only fire `handleNext()` if `isDragging` is false AND the `Date.now() - lastInteractionTime > 1000ms`. This prevents the auto-play from jumping immediately while user interacts or right after releasing the mouse.

---
*Developed by Assistant / Antigravity Agent*
# carousel
