"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>("system");
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    // Get system preference
    const getSystemTheme = (): "light" | "dark" => {
        if (typeof window === "undefined") return "light";
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
    }, []);

    // Update resolved theme when theme or system preference changes
    useEffect(() => {
        if (!mounted) return;

        const updateResolvedTheme = () => {
            const resolved = theme === "system" ? getSystemTheme() : theme;
            setResolvedTheme(resolved);

            // Apply to document
            if (resolved === "dark") {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        };

        updateResolvedTheme();

        // Listen for system preference changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                updateResolvedTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme, mounted]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
    };



    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Theme toggle button component for the header
 */
export function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
        { value: "light", label: "Light", icon: <Sun size={16} /> },
        { value: "dark", label: "Dark", icon: <Moon size={16} /> },
        { value: "system", label: "System", icon: <Monitor size={16} /> },
    ];

    const currentIcon = resolvedTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                title={`Current theme: ${theme}`}
            >
                {currentIcon}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                        {themes.map((t) => (
                            <button
                                key={t.value}
                                onClick={() => {
                                    setTheme(t.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${theme === t.value
                                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    }`}
                            >
                                {t.icon}
                                {t.label}
                                {theme === t.value && (
                                    <span className="ml-auto text-purple-600 dark:text-purple-400">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
