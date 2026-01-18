"use client";

import { useState, useRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    threshold?: number;
    disabled?: boolean;
}

export function PullToRefresh({
    onRefresh,
    children,
    threshold = 80,
    disabled = false,
}: PullToRefreshProps) {
    const [pulling, setPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled || refreshing) return;

        const container = containerRef.current;
        if (!container) return;

        // Only activate if at top of scroll
        if (container.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setPulling(true);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!pulling || disabled || refreshing) return;

        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        // Only allow pulling down (positive diff)
        if (diff > 0) {
            // Apply resistance - easier to pull at first, then harder
            const resistance = 0.4;
            const distance = Math.min(diff * resistance, threshold * 1.5);
            setPullDistance(distance);
        }
    };

    const handleTouchEnd = async () => {
        if (!pulling || disabled || refreshing) return;

        setPulling(false);

        // Trigger refresh if pulled past threshold
        if (pullDistance >= threshold) {
            setRefreshing(true);
            setPullDistance(0);

            try {
                await onRefresh();
            } finally {
                // Reset after a brief delay to show completion
                setTimeout(() => {
                    setRefreshing(false);
                }, 500);
            }
        } else {
            // Snap back
            setPullDistance(0);
        }
    };

    const progress = Math.min(pullDistance / threshold, 1);

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <div
                className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-10 transition-transform duration-200"
                style={{
                    transform: `translateY(${Math.max(pullDistance - 40, -40)}px)`,
                }}
            >
                <div
                    className={`rounded-full p-2 transition-all duration-200 ${
                        refreshing
                            ? "bg-primary/10"
                            : progress >= 1
                            ? "bg-primary/20"
                            : "bg-muted/50"
                    }`}
                >
                    {refreshing ? (
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                        <Loader2
                            className="w-6 h-6 text-muted-foreground transition-transform duration-200"
                            style={{
                                transform: `rotate(${progress * 360}deg)`,
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="relative">{children}</div>
        </div>
    );
}
