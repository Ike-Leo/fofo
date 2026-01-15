"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

/**
 * Parse Convex error messages into user-friendly format
 */
function parseErrorMessage(error: unknown): string {
    if (typeof error === "string") {
        // Handle Convex error format: [CONVEX M(...)] ... Error: message
        const convexMatch = error.match(/Error:\s*(.+?)(?:\s*at\s|$)/i);
        if (convexMatch) {
            return convexMatch[1].trim();
        }
        // Handle "Uncaught Error: message" format
        const uncaughtMatch = error.match(/Uncaught\s+Error:\s*(.+)/i);
        if (uncaughtMatch) {
            return uncaughtMatch[1].trim();
        }
        return error;
    }

    if (error instanceof Error) {
        // Clean up the error message
        let message = error.message;

        // Remove Convex technical prefixes
        message = message.replace(/\[CONVEX\s+[^\]]+\]\s*/g, "");
        message = message.replace(/\[Request\s+ID:[^\]]+\]\s*/g, "");
        message = message.replace(/Server\s+Error\s+/gi, "");
        message = message.replace(/Uncaught\s+Error:\s*/gi, "");

        // Extract just the meaningful part
        const errorMatch = message.match(/Error:\s*(.+?)(?:\s+at\s|$)/i);
        if (errorMatch) {
            return errorMatch[1].trim();
        }

        return message.trim();
    }

    return "An unexpected error occurred";
}

interface ToastProviderProps {
    children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9);
        const duration = toast.duration ?? (toast.type === "error" ? 6000 : 4000);

        setToasts((prev) => [...prev, { ...toast, id }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => {
        addToast({ type: "success", title, message });
    }, [addToast]);

    const error = useCallback((title: string, message?: string) => {
        addToast({ type: "error", title, message: parseErrorMessage(message || title) });
    }, [addToast]);

    const warning = useCallback((title: string, message?: string) => {
        addToast({ type: "warning", title, message });
    }, [addToast]);

    const info = useCallback((title: string, message?: string) => {
        addToast({ type: "info", title, message });
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
            ))}
        </div>
    );
}

interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const colors = {
        success: "bg-green-50 border-green-200 text-green-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    const iconColors = {
        success: "text-green-500",
        error: "text-red-500",
        warning: "text-amber-500",
        info: "text-blue-500",
    };

    const Icon = icons[toast.type];

    return (
        <div
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in ${colors[toast.type]}`}
            role="alert"
        >
            <Icon className={`flex-shrink-0 ${iconColors[toast.type]}`} size={20} />
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{toast.title}</p>
                {toast.message && toast.message !== toast.title && (
                    <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>
                )}
                {toast.action && (
                    <button
                        onClick={toast.action.onClick}
                        className="text-sm font-medium underline mt-2 hover:opacity-80"
                    >
                        {toast.action.label}
                    </button>
                )}
            </div>
            <button
                onClick={onRemove}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
}

/**
 * Higher-order function to wrap async operations with toast notifications
 */
export function withToast<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    toast: ToastContextValue,
    options?: {
        successTitle?: string;
        successMessage?: string;
        errorTitle?: string;
    }
): T {
    return (async (...args: Parameters<T>) => {
        try {
            const result = await fn(...args);
            if (options?.successTitle) {
                toast.success(options.successTitle, options.successMessage);
            }
            return result;
        } catch (error) {
            toast.error(
                options?.errorTitle || "Operation Failed",
                parseErrorMessage(error)
            );
            throw error;
        }
    }) as T;
}

// CSS animation for the toast slide-in effect
// Add this to your global CSS:
// @keyframes slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
// .animate-slide-in { animation: slide-in 0.3s ease-out; }
