"use client";

import { useRef, useState, useCallback, useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  pulling: boolean;
  refreshing: boolean;
  pullToRefreshIndicator: ReactNode;
  ref: React.RefObject<HTMLDivElement | null>;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    const scrollableElement = ref.current;

    // Only trigger if at top of scrollable element
    if (scrollableElement && scrollableElement.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !pulling || refreshing) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    // Only allow pulling down (positive distance)
    if (distance > 0) {
      // Add resistance - distance / 2.5 makes it harder to pull further
      const resistance = distance / 2.5;
      setPullDistance(Math.min(resistance, threshold * 1.5));
    }
  }, [disabled, pulling, refreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !pulling) return;

    setPulling(false);

    // Trigger refresh if pulled past threshold
    if (pullDistance >= threshold) {
      setRefreshing(true);
      setPullDistance(threshold);

      try {
        await onRefresh();
      } finally {
        // Reset after a short delay to show completion
        setTimeout(() => {
          setRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // Reset if didn't reach threshold
      setPullDistance(0);
    }
  }, [disabled, pulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd);

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, disabled]);

  // Calculate opacity based on pull distance
  const opacity = Math.min(pullDistance / threshold, 1);

  // Pull-to-refresh indicator component
  const pullToRefreshIndicator = pullDistance > 0 || refreshing ? (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-200"
      style={{
        height: `${Math.min(pullDistance, threshold)}px`,
        background: `linear-gradient(to bottom, rgba(251, 191, 36, ${opacity * 0.2}), transparent)`,
      }}
    >
      {refreshing ? (
        <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
      ) : (
        <Loader2
          className="w-6 h-6 text-accent-primary transition-transform"
          style={{
            transform: `rotate(${Math.min(pullDistance, threshold) * 2.7}deg)`,
          }}
        />
      )}
    </div>
  ) : null;

  return {
    pullDistance,
    pulling,
    refreshing,
    pullToRefreshIndicator,
    ref,
  };
}
