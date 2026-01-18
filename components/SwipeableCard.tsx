"use client";

import { useRef, useState, useCallback, useEffect, ReactNode, MouseEvent } from "react";
import { Trash2, Archive } from "lucide-react";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActionLabel?: string;
  rightActionLabel?: string;
  disabled?: boolean;
  undoable?: boolean;
  onUndo?: () => void;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionLabel = "Delete",
  rightActionLabel = "Archive",
  disabled = false,
  undoable = false,
  onUndo,
}: SwipeableCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, [disabled]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !isSwiping) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;

    // Limit swipe distance
    const maxSwipe = 150;
    setTranslateX(Math.max(-maxSwipe, Math.min(maxSwipe, deltaX)));
  }, [disabled, isSwiping]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (disabled || !isSwiping) return;

    setIsSwiping(false);

    // Threshold for triggering actions
    const threshold = 100;

    if (translateX > threshold && onSwipeRight) {
      // Swiped right - archive action
      onSwipeRight();
      if (undoable) {
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 3000);
      }
    } else if (translateX < -threshold && onSwipeLeft) {
      // Swiped left - delete action
      onSwipeLeft();
      if (undoable) {
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 3000);
      }
    } else {
      // Reset position
      setTranslateX(0);
    }
  }, [disabled, isSwiping, translateX, onSwipeLeft, onSwipeRight, undoable]);

  // Handle mouse events for desktop testing
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    currentX.current = e.clientX;
    setIsSwiping(true);
  }, [disabled]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (disabled || !isSwiping) return;

    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;

    const maxSwipe = 150;
    setTranslateX(Math.max(-maxSwipe, Math.min(maxSwipe, deltaX)));
  }, [disabled, isSwiping]);

  const handleMouseUp = useCallback(() => {
    if (disabled || !isSwiping) return;

    setIsSwiping(false);

    const threshold = 100;

    if (translateX > threshold && onSwipeRight) {
      onSwipeRight();
      if (undoable) {
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 3000);
      }
    } else if (translateX < -threshold && onSwipeLeft) {
      onSwipeLeft();
      if (undoable) {
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 3000);
      }
    } else {
      setTranslateX(0);
    }
  }, [disabled, isSwiping, translateX, onSwipeLeft, onSwipeRight, undoable]);

  // Add mouse event listeners for desktop
  useEffect(() => {
    const element = containerRef.current;
    if (!element || disabled) return;

    element.addEventListener("mousedown", handleMouseDown as unknown as EventListener);
    window.addEventListener("mousemove", handleMouseMove as unknown as EventListener);
    window.addEventListener("mouseup", handleMouseUp as unknown as EventListener);

    return () => {
      element.removeEventListener("mousedown", handleMouseDown as unknown as EventListener);
      window.removeEventListener("mousemove", handleMouseMove as unknown as EventListener);
      window.removeEventListener("mouseup", handleMouseUp as unknown as EventListener);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, disabled]);

  // Handle undo
  const handleUndo = useCallback(() => {
    setShowUndo(false);
    setTranslateX(0);
    if (onUndo) {
      onUndo();
    }
  }, [onUndo]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Left action indicator (swipe right) */}
      {onSwipeRight && (
        <div className="absolute inset-y-0 left-0 w-20 bg-accent-success flex items-center justify-center translate-x-full transition-transform duration-200">
          <Archive className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Right action indicator (swipe left) */}
      {onSwipeLeft && (
        <div className="absolute inset-y-0 right-0 w-20 bg-accent-danger flex items-center justify-center -translate-x-full transition-transform duration-200">
          <Trash2 className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Foreground content */}
      <div
        ref={containerRef}
        className="relative bg-tertiary transition-transform duration-200 touch-none"
        style={{
          transform: `translateX(${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Undo notification */}
      {showUndo && (
        <div className="absolute bottom-4 left-4 right-4 bg-elevated border border-subtle rounded-xl p-4 flex items-center justify-between shadow-xl animate-slide-up">
          <span className="text-body-md text-primary">
            {translateX < 0 ? leftActionLabel : rightActionLabel} completed
          </span>
          <button
            onClick={handleUndo}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg font-semibold text-sm hover:opacity-90 active:scale-95 transition-all min-h-[44px]"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
