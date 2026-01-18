"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  showClose?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
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

  // Size styles for desktop (mobile is always full-screen bottom sheet)
  const sizeStyles = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    full: "sm:max-w-full sm:mx-8",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={`relative bg-card w-full ${sizeStyles[size]} sm:rounded-xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl slide-up-sheet sm:modal-in ${className}`}
      >
        {/* Mobile Swipe Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
    <div className={`px-6 py-4 border-t border-border flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
