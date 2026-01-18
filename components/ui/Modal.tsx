"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  showClose?: boolean;
  showSwipeHandle?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  showSwipeHandle = true,
  className = "",
}: ModalProps) {
  // Handle escape key to close
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // Size styles for desktop (mobile is always full-width bottom sheet)
  const sizeStyles = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    full: "sm:max-w-full sm:mx-8",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Glass backdrop */}
      <div
        className="fixed inset-0 bg-secondary/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative bg-tertiary w-full ${sizeStyles[size]} sm:rounded-xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-subtle animate-scale-in sm:animate-modal-in ${className}`}
      >
        {/* Mobile Swipe Handle */}
        {showSwipeHandle && (
          <div className="flex justify-center pt-4 pb-1 sm:hidden">
            <div className="w-12 h-1.5 bg-elevated rounded-full" />
          </div>
        )}

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-subtle glass-strong">
            {title && (
              <h2 className="text-heading-lg font-bold text-primary">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-secondary hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active-scale"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Modal Footer Component
export function ModalFooter({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`px-6 py-4 border-t border-subtle flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
